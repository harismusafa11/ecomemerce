import prisma from '../server/db';

async function main() {
    const email = 'admin@tapakpamungkas.com';
    const password = 'admin123';
    const name = 'Admin Pamungkas';

    console.log(`Seeding admin user: ${email}...`);

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            password,
            isAdmin: true,
            name,
        },
        create: {
            email,
            password,
            name,
            isAdmin: true,
        },
    });

    console.log(`Admin user upserted: ${user.email} (ID: ${user.id})`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
