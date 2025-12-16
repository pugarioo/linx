'use server'

import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg'; // 1. You need to import Pool from 'pg'

// 2. Initialize the Pool first, then pass it to the adapter
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

interface ActionResponse {
    success: boolean,
    url?: string,
    error?: string
}

export async function requestlink(inputUrl: string): Promise<ActionResponse> {
    const pageDomain = process.env.PAGE_DOMAIN

    while (true) {
        const generated_code = generate_code()
        try {
            await prisma.link.create({
                data: {
                    orig_link: inputUrl,
                    short_code: generated_code
                },
                select: {
                    short_code : true, 
                }
            })
            
            return {
                success: true,
                url: `${pageDomain}/${generated_code}`,
            }
            
        }
        catch(err) { // 3. Use 'any' here or the safe helper below
            // Using your helper function is great, but ensure it works with 'unknown'
            if (isPrismaError(err)) {
                if (err.code === 'P2002') { 
                    continue;
                }
            }
            console.log(`Error generating link: ${err}`)
            return {
                success: false,
                error: "There's an error generating the link, please try again"
            }
        }

    }
}

export async function get_orig_link(short_code: string): Promise<ActionResponse> {
    let retries = 3

    while (retries > 0 ) {
        try {
            const link = await prisma.link.findUniqueOrThrow({
                where: {
                    short_code: short_code
                },
                select: {
                    orig_link: true,
                    clicks: true
                }
            })

            return {
                success: true,
                url: link.orig_link
            }
            
        }
        catch (err: unknown) { // Explicitly unknown is good practice
            // 4. Split the check to be safe in strict mode
            const isPrisma = isPrismaError(err);
            if (!isPrisma || (isPrisma && err.code !== 'P2025')) {
                 // Retry if it's NOT a "Not Found" error (P2025)
                 // OR if it's some other random error
                 retries--
                 continue
            }
            
            // If we get here, it IS a P2025 error (Link not found)
            return {
                success: false,
                error: 'Link does not exist'
            }
        }
    }

    return {
        success: false,
        error: 'Link does not exist'
    }
}

export async function update_clicks(short_code : string) {
    await prisma.link.update({
        where: {
            short_code: short_code
        },
        data: {
            clicks: {
                increment: 1
            },
            last_clicked: new Date()
        }
    })
}

function generate_code () {
    return (Math.random() + 1).toString(36).substring(2, 8)
}

// 5. Ensure this Type Guard is robust
function isPrismaError(e: unknown): e is Prisma.PrismaClientKnownRequestError {
  return e instanceof Prisma.PrismaClientKnownRequestError;
}