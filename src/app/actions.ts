'use server'

import prisma from "@/lib/prisma"

export type SearchResult = {
    id: string
    title: string
    subtitle: string
    type: 'asset' | 'person' | 'assignment'
    url: string
}

export async function globalSearchAction(query: string): Promise<SearchResult[]> {
    if (!query || query.length < 2) return []

    const results: SearchResult[] = []

    // 1. Search Assets (Name, Code, Serial)
    const assets = await prisma.activo.findMany({
        where: {
            OR: [
                { nombre: { contains: query, mode: 'insensitive' } },
                { codigoInterno: { contains: query, mode: 'insensitive' } },
                { serial: { contains: query, mode: 'insensitive' } },
            ]
        },
        take: 5
    })

    results.push(...assets.map(a => ({
        id: a.id,
        title: `${a.codigoInterno} - ${a.nombre}`,
        subtitle: `Activo - ${a.estado}`,
        type: 'asset' as const,
        url: `/activos/${a.id}`
    })))

    // 2. Search People (Name, Email)
    const people = await prisma.persona.findMany({
        where: {
            OR: [
                { nombre: { contains: query, mode: 'insensitive' } },
                { email: { contains: query, mode: 'insensitive' } },
            ]
        },
        take: 3
    })

    results.push(...people.map(p => ({
        id: p.id,
        title: p.nombre,
        subtitle: `${p.cargo || 'Sin cargo'} - ${p.departamento}`,
        type: 'person' as const,
        url: `/personas/${p.id}`
    })))

    return results
}
