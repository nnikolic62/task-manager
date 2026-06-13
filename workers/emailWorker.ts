import { Resend } from 'resend'
import { db } from '@/db'
import { jobs } from '@/db/schema'
import { eq, and } from 'drizzle-orm'

const resend = new Resend(process.env.RESEND_API_KEY);

async function procceessJobs() {
    await db.transaction(async (tx) => {
        const [job] = await db
            .select()
            .from(jobs)
            .where(eq(jobs.status, 'pending'))
            .limit(1)
            .for('update', { skipLocked: true });
        if (!job) {
            return;
        }

        await db
            .update(jobs)
            .set({ status: 'processing', attempts: job.attempts + 1 })
            .where(eq(jobs.id, job.id));

        try {
            const payload = job.payload as { to: string; subject: string; html: string };

            await resend.emails.send({
                from: 'onboarding@resend.dev',
                to: payload.to,
                subject: payload.subject,
                html: payload.html,
            });

            await db
                .update(jobs)
                .set({ status: 'done', processedAt: new Date() })
                .where(eq(jobs.id, job.id));
            console.log(`✓ Email sent to ${payload.to}`)
        } catch (error) {
            await db
                .update(jobs)
                .set({ status: 'failed', processedAt: new Date(), lastError: String(error) })
                .where(eq(jobs.id, job.id));
            console.log(`✗ Email failed to send to: ${String(error)}`)
        }
    });
}

setInterval(procceessJobs, 3000);
console.log('Worker started, polling every 3s...')