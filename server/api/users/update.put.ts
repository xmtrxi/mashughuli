import { defineEventHandler, readValidatedBody, sendError, createError } from 'h3';
import { updateUser } from '~/server/services/auth/auth.service';
import { profileSchema } from '~/shared/schemas/profileData.schema';

export default defineEventHandler(async (event) => {
    if (event.node.req.method !== 'PUT') {
        return sendError(
            event,
            createError({
                status: 405,
                message: 'Method Not Allowed',
            }),
        );
    }

    const userId = 'ae33b77b-d31b-4a20-86b2-7411a49b5912'; // Replace with actual logic to get the user ID

    if (!userId) {
        return sendError(
            event,
            createError({
                status: 401,
                message: 'Unauthorized',
            }),
        );
    }

    const { data, error } = await readValidatedBody(event, profileSchema.safeParse);
    if (!data) {
        return sendError(
            event,
            createError({
                status: 422,
                message: error.issues.map(issue => issue.message).join(', '),
            }),
        );
    }

    try {
        const user = await updateUser(userId, data);
        return {
            success: true,
            data: user,
        };
    } catch (error: any) {
        return sendError(

            event,
            createError({
                status: 500,
                message: error.message || 'Failed to update user',
            }),
        );
    }
});