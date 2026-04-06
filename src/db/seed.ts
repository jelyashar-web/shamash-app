import { db } from './index';
import { users, members, aliyot, donations, events } from './schema';
import { hash } from 'bcryptjs';
import { config } from 'dotenv';

config();

async function seed() {
  console.log('Seeding database...');

  try {
    // Seed users
    const adminPassword = await hash('admin123', 10);
    const gabbaiPassword = await hash('gabbai123', 10);

    await db.insert(users).values([
      {
        email: 'admin@shamash.app',
        passwordHash: adminPassword,
        role: 'admin',
      },
      {
        email: 'gabbai@shamash.app',
        passwordHash: gabbaiPassword,
        role: 'gabbai',
      },
    ]);
    console.log('Users seeded');

    // Seed members
    const now = new Date();
    const memberData = await db.insert(members).values([
      {
        name: 'Cohen Family',
        phone: '555-0101',
        email: 'cohen@example.com',
        role: 'kohen',
        notes: 'Regular Shabbat attendee',
      },
      {
        name: 'Levi Family',
        phone: '555-0102',
        email: 'levi@example.com',
        role: 'levi',
        notes: 'Second aliyah preference',
      },
      {
        name: 'Israel Family',
        phone: '555-0103',
        email: 'israel@example.com',
        role: 'yisrael',
        notes: 'Shlishi preference',
      },
      {
        name: 'Sarah Cohen',
        phone: '555-0104',
        email: 'sarah@example.com',
        role: 'yisrael',
        yahrzeitDate: '12-15',
        notes: 'Yahrzeit on 15 Kislev',
      },
    ]).returning();
    console.log('Members seeded');

    // Seed aliyot
    const shabbatDate = new Date(now);
    shabbatDate.setDate(shabbatDate.getDate() + (6 - shabbatDate.getDay() + 7) % 7);

    await db.insert(aliyot).values([
      {
        memberId: memberData[0].id,
        date: shabbatDate,
        type: 'kohen',
        parasha: 'Bereshit',
        assigned: true,
      },
      {
        memberId: memberData[1].id,
        date: shabbatDate,
        type: 'levi',
        parasha: 'Bereshit',
        assigned: true,
      },
      {
        memberId: memberData[2].id,
        date: shabbatDate,
        type: 'shlishi',
        parasha: 'Bereshit',
        assigned: true,
      },
    ]);
    console.log('Aliyot seeded');

    // Seed donations
    await db.insert(donations).values([
      {
        memberId: memberData[0].id,
        amount: 180.0,
        description: 'Shabbat kiddush sponsorship',
        paid: true,
        date: now,
      },
      {
        memberId: memberData[2].id,
        amount: 360.0,
        description: 'Building fund contribution',
        paid: false,
        date: now,
      },
    ]);
    console.log('Donations seeded');

    // Seed events
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    await db.insert(events).values([
      {
        title: 'Shabbat Morning Service',
        date: shabbatDate,
        description: 'Regular Shabbat service with Torah reading',
        type: 'service',
      },
      {
        title: 'Board Meeting',
        date: nextWeek,
        description: 'Monthly synagogue board meeting',
        type: 'meeting',
      },
      {
        title: 'Chanukah Celebration',
        date: nextMonth,
        description: 'Community Chanukah party and candle lighting',
        type: 'holiday',
      },
    ]);
    console.log('Events seeded');

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
