from prisma import Prisma

# Shared database instance
prisma = Prisma()

async def get_db()->Prisma:
    if not prisma.is_connected():
        await prisma.connect()
    return prisma

async def connect_db():
    """Connect to the database"""
    if not prisma.is_connected():
        await prisma.connect()
    print("✅ Database connected")

async def disconnect_db():
    """Disconnect from the database"""
    if prisma.is_connected():
        await prisma.disconnect()
    print("❌ Database disconnected")