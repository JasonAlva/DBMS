import asyncio
from prisma import Prisma


async def main():
    db = Prisma()
    await db.connect()
    print("✅ Connected to PostgreSQL successfully!")
    await db.disconnect()

asyncio.run(main())