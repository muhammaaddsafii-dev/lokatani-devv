from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timedelta
from passlib.context import CryptContext
import bcrypt
from jose import JWTError, jwt
from bson import ObjectId

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Password hashing using bcrypt directly
def verify_password(plain_password, hashed_password):
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))


def get_password_hash(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    
    user = await db.users.find_one({"username": username})
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    
    user['id'] = str(user['_id'])
    return User(**user)


# ===== Auth Endpoints =====

@api_router.post("/register", response_model=Token)
async def register(user_data: UserRegister):
    # Check if user exists
    existing_user = await db.users.find_one({"username": user_data.username})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    # Validate role
    if user_data.role not in ["farmer", "buyer"]:
        raise HTTPException(status_code=400, detail="Role must be 'farmer' or 'buyer'")
    
    # Create user
    user_dict = {
        "username": user_data.username,
        "password": get_password_hash(user_data.password),
        "name": user_data.name,
        "phone": user_data.phone,
        "role": user_data.role,
        "created_at": datetime.utcnow()
    }
    
    result = await db.users.insert_one(user_dict)
    
    # Create access token
    access_token = create_access_token(data={"sub": user_data.username})
    
    # Return user and token
    user_dict['id'] = str(result.inserted_id)
    user_dict.pop('password')
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": User(**user_dict)
    }


@api_router.post("/login", response_model=Token)
async def login(user_data: UserLogin):
    # Find user
    user = await db.users.find_one({"username": user_data.username})
    if not user or not verify_password(user_data.password, user['password']):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    
    # Create access token
    access_token = create_access_token(data={"sub": user_data.username})
    
    # Return user and token
    user['id'] = str(user['_id'])
    user.pop('password')
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": User(**user)
    }


@api_router.get("/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


# ===== Product Endpoints =====

@api_router.get("/products", response_model=List[Product])
async def get_products():
    products = await db.products.find().to_list(1000)
    for product in products:
        product['id'] = str(product['_id'])
    return products


@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    try:
        product = await db.products.find_one({"_id": ObjectId(product_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid product ID")
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product['id'] = str(product['_id'])
    return product


@api_router.post("/products", response_model=Product)
async def create_product(product_data: ProductCreate, current_user: User = Depends(get_current_user)):
    # Only farmers can create products
    if current_user.role != "farmer":
        raise HTTPException(status_code=403, detail="Only farmers can create products")
    
    product_dict = product_data.dict()
    product_dict['farmer_id'] = current_user.id
    product_dict['farmer_name'] = current_user.name
    product_dict['created_at'] = datetime.utcnow()
    
    result = await db.products.insert_one(product_dict)
    
    product_dict['id'] = str(result.inserted_id)
    return Product(**product_dict)


@api_router.put("/products/{product_id}", response_model=Product)
async def update_product(product_id: str, product_data: ProductUpdate, current_user: User = Depends(get_current_user)):
    # Only farmers can update products
    if current_user.role != "farmer":
        raise HTTPException(status_code=403, detail="Only farmers can update products")
    
    try:
        product = await db.products.find_one({"_id": ObjectId(product_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid product ID")
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check ownership
    if str(product.get('farmer_id')) != current_user.id:
        raise HTTPException(status_code=403, detail="You can only update your own products")
    
    # Update product
    update_data = {k: v for k, v in product_data.dict().items() if v is not None}
    if update_data:
        await db.products.update_one({"_id": ObjectId(product_id)}, {"$set": update_data})
    
    updated_product = await db.products.find_one({"_id": ObjectId(product_id)})
    updated_product['id'] = str(updated_product['_id'])
    
    return Product(**updated_product)


@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, current_user: User = Depends(get_current_user)):
    # Only farmers can delete products
    if current_user.role != "farmer":
        raise HTTPException(status_code=403, detail="Only farmers can delete products")
    
    try:
        product = await db.products.find_one({"_id": ObjectId(product_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid product ID")
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check ownership
    if str(product.get('farmer_id')) != current_user.id:
        raise HTTPException(status_code=403, detail="You can only delete your own products")
    
    await db.products.delete_one({"_id": ObjectId(product_id)})
    
    return {"message": "Product deleted successfully"}


@api_router.get("/my-products", response_model=List[Product])
async def get_my_products(current_user: User = Depends(get_current_user)):
    if current_user.role != "farmer":
        raise HTTPException(status_code=403, detail="Only farmers have products")
    
    products = await db.products.find({"farmer_id": current_user.id}).to_list(1000)
    for product in products:
        product['id'] = str(product['_id'])
    return products


# ===== Cart Endpoints =====

@api_router.get("/cart")
async def get_cart(current_user: User = Depends(get_current_user)):
    cart = await db.carts.find_one({"user_id": current_user.id})
    
    if not cart:
        return {"user_id": current_user.id, "items": []}
    
    # Get full product details for each item
    cart_items = []
    for item in cart.get('items', []):
        try:
            product = await db.products.find_one({"_id": ObjectId(item['product_id'])})
            if product:
                product['id'] = str(product['_id'])
                cart_items.append({
                    "product": product,
                    "quantity": item['quantity']
                })
        except:
            continue
    
    return {"user_id": current_user.id, "items": cart_items}


@api_router.post("/cart/add")
async def add_to_cart(cart_item: AddToCart, current_user: User = Depends(get_current_user)):
    # Check if product exists
    try:
        product = await db.products.find_one({"_id": ObjectId(cart_item.product_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid product ID")
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Get or create cart
    cart = await db.carts.find_one({"user_id": current_user.id})
    
    if not cart:
        cart = {
            "user_id": current_user.id,
            "items": [],
            "updated_at": datetime.utcnow()
        }
        await db.carts.insert_one(cart)
    
    # Check if product already in cart
    items = cart.get('items', [])
    found = False
    
    for item in items:
        if item['product_id'] == cart_item.product_id:
            item['quantity'] += cart_item.quantity
            found = True
            break
    
    if not found:
        items.append({
            "product_id": cart_item.product_id,
            "quantity": cart_item.quantity
        })
    
    # Update cart
    await db.carts.update_one(
        {"user_id": current_user.id},
        {"$set": {"items": items, "updated_at": datetime.utcnow()}}
    )
    
    return {"message": "Product added to cart"}


@api_router.delete("/cart/remove/{product_id}")
async def remove_from_cart(product_id: str, current_user: User = Depends(get_current_user)):
    cart = await db.carts.find_one({"user_id": current_user.id})
    
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    items = cart.get('items', [])
    items = [item for item in items if item['product_id'] != product_id]
    
    await db.carts.update_one(
        {"user_id": current_user.id},
        {"$set": {"items": items, "updated_at": datetime.utcnow()}}
    )
    
    return {"message": "Product removed from cart"}


@api_router.post("/cart/clear")
async def clear_cart(current_user: User = Depends(get_current_user)):
    await db.carts.update_one(
        {"user_id": current_user.id},
        {"$set": {"items": [], "updated_at": datetime.utcnow()}}
    )
    
    return {"message": "Cart cleared"}


# ===== Order Endpoints =====

@api_router.post("/orders", response_model=Order)
async def create_order(order_data: CreateOrder, current_user: User = Depends(get_current_user)):
    # Only buyers can create orders
    if current_user.role != "buyer":
        raise HTTPException(status_code=403, detail="Only buyers can create orders")
    
    order_dict = {
        "buyer_id": current_user.id,
        "buyer_name": current_user.name,
        "items": order_data.items,
        "total": order_data.total,
        "status": "completed",  # Mock payment always succeeds
        "created_at": datetime.utcnow()
    }
    
    result = await db.orders.insert_one(order_dict)
    
    # Clear cart after order
    await db.carts.update_one(
        {"user_id": current_user.id},
        {"$set": {"items": [], "updated_at": datetime.utcnow()}}
    )
    
    order_dict['id'] = str(result.inserted_id)
    return Order(**order_dict)


@api_router.get("/orders", response_model=List[Order])
async def get_orders(current_user: User = Depends(get_current_user)):
    orders = await db.orders.find({"buyer_id": current_user.id}).to_list(1000)
    for order in orders:
        order['id'] = str(order['_id'])
    return orders


# ===== Root Route =====

@api_router.get("/")
async def root():
    return {"message": "Lokatani API - Marketplace untuk Petani & Pembeli"}


# Include router in app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
