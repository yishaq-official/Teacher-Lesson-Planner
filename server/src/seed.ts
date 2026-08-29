import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import { LessonPlan } from './models/LessonPlan.js';
import { Resource } from './models/Resource.js';
import { auth } from './config/auth.js';

const seed = async () => {
  try {
    await connectDB();
    console.log('Seeding initial teacher lesson planner database...');

    // Clear previous demo records if any
    await LessonPlan.deleteMany({});
    await Resource.deleteMany({});

    // Create Demo Teacher Account via auth API or dummy ID
    const demoTeacherId = 'demo-teacher-id-12345';

    // 1. Create Shared Teaching Resources
    const res1 = await Resource.create({
      title: 'Photosynthesis & Chloroplast Structure Diagram Worksheet',
      description: 'Comprehensive 2-page student worksheet covering light-dependent reactions, Calvin cycle, and chloroplast anatomy with answer key.',
      fileUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/biodemo_photosynthesis.pdf',
      filePublicId: 'biodemo_photosynthesis',
      fileSize: 1048576,
      fileType: 'application/pdf',
      subject: 'Biology',
      grade: 'Grade 9',
      topic: 'Photosynthesis & Cellular Energy',
      type: 'worksheet',
      teacherId: demoTeacherId,
      downloadsCount: 42,
      tags: ['biology', 'photosynthesis', 'worksheet', 'cell-biology'],
    });

    const res2 = await Resource.create({
      title: 'Quadratic Functions & Parabola Graphing Slide Deck',
      description: '30-slide presentation explaining vertex form, axis of symmetry, and real-world trajectory problem solving.',
      fileUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/math_quadratics.pptx',
      filePublicId: 'math_quadratics',
      fileSize: 3145728,
      fileType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      subject: 'Mathematics',
      grade: 'Grade 10',
      topic: 'Quadratic Functions & Algebra',
      type: 'presentation',
      teacherId: demoTeacherId,
      downloadsCount: 18,
      tags: ['math', 'algebra', 'slides', 'quadratics'],
    });

    const res3 = await Resource.create({
      title: 'Periodic Table & Chemical Bonding Midterm Review Exam',
      description: 'Practice exam with multiple choice, short answer, and ionic vs covalent bonding diagrams.',
      fileUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/chem_midterm_exam.pdf',
      filePublicId: 'chem_midterm_exam',
      fileSize: 2097152,
      fileType: 'application/pdf',
      subject: 'Chemistry',
      grade: 'Grade 11',
      topic: 'Chemical Bonding & Periodic Trends',
      type: 'exam',
      teacherId: demoTeacherId,
      downloadsCount: 29,
      tags: ['chemistry', 'exam', 'periodic-table', 'bonding'],
    });

    console.log('Sample teaching resources created!');

    // 2. Create Sample Lesson Plans
    await LessonPlan.create({
      title: 'Cellular Respiration & ATP Production',
      subject: 'Biology',
      grade: 'Grade 9',
      topic: 'Glycolysis, Krebs Cycle & Electron Transport',
      date: new Date(Date.now() + 86400000 * 2), // 2 days from today
      duration: 50,
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
      teacherNotes: 'Bring mitochondrion model model from lab prep room before Period 2.',
      status: 'upcoming',
      teacherId: demoTeacherId,
      resources: [res1._id],
    });

    await LessonPlan.create({
      title: 'Solving Systems of Linear Equations by Substitution',
      subject: 'Mathematics',
      grade: 'Grade 10',
      topic: 'Systems of Equations',
      date: new Date(Date.now() + 86400000 * 4), // 4 days from today
      duration: 45,
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
      teacherId: demoTeacherId,
      resources: [res2._id],
    });

    await LessonPlan.create({
      title: 'Introduction to Chemical Reactions & Stoichiometry',
      subject: 'Chemistry',
      grade: 'Grade 11',
      topic: 'Balancing Chemical Equations',
      date: new Date(Date.now() - 86400000 * 3), // 3 days ago (completed)
      duration: 60,
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
      teacherId: demoTeacherId,
      resources: [res3._id],
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
