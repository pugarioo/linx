'use server'

import { PrismaClient, Prisma } from "@prisma/client";
// import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ 
  connectionString: process.env.DATABASE_URL 
});
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
        catch(err) {

            if (err instanceof Prisma.PrismaClientKnownRequestError){
                if (err.code === 'P2002') {
                    continue
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
        catch (err) {
            if (!(err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025')) {
                
                retries--
                continue
            }
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
