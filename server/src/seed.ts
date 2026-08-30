import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import { LessonPlan } from './models/LessonPlan.js';
import { Resource } from './models/Resource.js';
import { auth, mongoClient } from './config/auth.js';

const seed = async () => {
  try {
    await connectDB();
    console.log('Seeding initial teacher lesson planner database...');

    const db = mongoClient.db();

    // Clear previous collections
    await LessonPlan.deleteMany({});
    await Resource.deleteMany({});
    await db.collection('user').deleteMany({});
    await db.collection('account').deleteMany({});
    await db.collection('session').deleteMany({});

    console.log('Cleared existing data.');

    // 1. Create Demo Teacher Account using Better Auth API
    const authUser = await auth.api.signUpEmail({
      body: {
        email: 'hana.teacher@edushelf.org',
        password: 'TeacherPass123!',
        name: 'Hana Tesfaye',
        subject: 'Biology',
        institution: 'Nexus Science Academy',
      },
    });

    const teacherId = authUser.user.id;
    console.log(`Demo Teacher Account created! User ID: ${teacherId}`);

    // 2. Sample resources step removed (teachers upload their own real resources)

    // 3. Create Sample Lesson Plans
    await LessonPlan.create({
      title: 'Cellular Respiration & ATP Production',
      subject: 'Biology',
      grade: 'Grade 9',
      topic: 'Glycolysis, Krebs Cycle & Electron Transport',
      date: new Date(Date.now() + 86400000 * 1), // Tomorrow
      duration: 50,
      period: 'Period 1 (08:30 - 09:15)',
      objectives: [
        'Compare cellular respiration formula with photosynthesis formula',
        'Identify the three main stages of cellular respiration',
        'Explain the role of ATP as cellular energy currency',
      ],
      introduction: 'Hook question: How do our muscles turn lunch into movement energy? Quick 5-min video clip on ATP.',
      mainActivity: 'Interactive lecture introducing Glycolysis in cytoplasm and Mitochondrion matrix operations.',
      practiceActivity: 'Group activity: Map out inputs and outputs of Krebs cycle using diagram cards.',
      conclusion: '5-minute exit ticket checking understanding of aerobic vs anaerobic respiration.',
      homework: 'Complete textbook page 112 exercises 1-8.',
      teacherNotes: 'Bring mitochondrion model from lab prep room before Period 2.',
      status: 'upcoming',
      teacherId: teacherId,
      resources: [],
    });

    await LessonPlan.create({
      title: 'Solving Systems of Linear Equations by Substitution',
      subject: 'Mathematics',
      grade: 'Grade 10',
      topic: 'Systems of Equations',
      date: new Date(Date.now() + 86400000 * 2), // 2 days from today
      duration: 45,
      period: 'Period 2 (09:20 - 10:05)',
      objectives: [
        'Isolate one variable in a two-variable linear equation',
        'Substitute expressions to solve for unknown variables',
        'Verify solutions graphically and algebraically',
      ],
      introduction: 'Review 1-variable linear equation solving with 2 warm-up problems on the board.',
      mainActivity: 'Step-by-step demonstration of substitution method using guided example problems.',
      practiceActivity: 'Paired problem-solving worksheet with teacher circulating for targeted intervention.',
      conclusion: 'Collect problem set and review common pitfalls.',
      homework: 'Worksheet 4.2 problems 1-10.',
      teacherNotes: 'Check in with Sarah and Marcus on isolating terms with negative coefficients.',
      status: 'upcoming',
      teacherId: teacherId,
      resources: [],
    });

    await LessonPlan.create({
      title: 'Introduction to Chemical Reactions & Stoichiometry',
      subject: 'Chemistry',
      grade: 'Grade 11',
      topic: 'Balancing Chemical Equations',
      date: new Date(Date.now()), // Today
      duration: 60,
      period: 'Period 4 (11:15 - 12:00)',
      objectives: [
        'State the Law of Conservation of Mass',
        'Balance chemical equations using stoichiometric coefficients',
      ],
      introduction: 'Demonstration of vinegar and baking soda reaction on digital mass scale.',
      mainActivity: 'Lesson on balancing equations: reactants vs products, coefficient rules.',
      practiceActivity: 'Individual white-board practice balancing 10 chemical equations.',
      conclusion: 'Class discussion on why subscript numbers cannot be altered.',
      homework: 'Read Chapter 5.1 and complete problem set.',
      teacherNotes: 'Lab demo went great! High student participation during whiteboard section.',
      status: 'completed',
      teacherId: teacherId,
      resources: [],
    });

    console.log('Sample lesson plans created!');
    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seed();
