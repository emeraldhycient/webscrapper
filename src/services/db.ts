import prisma from '../utils/prismaClient';

export async function saveJobData(jobData: any) {
    try {
        await prisma.job.create({ data: jobData });
    } catch (error) {
        console.error('Error saving job data:', error);
    }
}
