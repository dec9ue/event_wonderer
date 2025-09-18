import { PrismaClient, Role, ReportStatus, GeomType, AttachmentType, AuditAction } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  // Admin user
  const adminEmail = 'admin@example.com'
  const adminPassword = 'Admin123!'
  const password_hash = await bcrypt.hash(adminPassword, 10)

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: 'Admin',
      email: adminEmail,
      password_hash,
      role: Role.admin,
    },
  })

  // Tags
  const tagNames = ['safety', 'maintenance', 'urgent']
  const tags = await Promise.all(
    tagNames.map((name) =>
      prisma.tag.upsert({
        where: { name },
        update: {},
        create: { name },
      })
    )
  )

  // Floor
  const floor = await prisma.floor.create({
    data: {
      name: 'Main Floor',
      imageUrl: 'https://example.com/factory-map.png',
      widthPx: 4096,
      heightPx: 3072,
      transformJson: null,
    },
  })

  // Reports
  const now = new Date()
  const earlier = new Date(now.getTime() - 1000 * 60 * 60)

  const report1 = await prisma.report.create({
    data: {
      title: 'Oil spill near machine A',
      body: 'Observed oil on the floor; slippery area. Needs cleanup.',
      status: ReportStatus.open,
      observedAt: earlier,
      geomType: GeomType.point,
      x: 1200,
      y: 850,
      floor: { connect: { id: floor.id } },
      createdBy: { connect: { id: admin.id } },
      updatedBy: { connect: { id: admin.id } },
      tags: {
        create: [
          { tag: { connect: { id: tags[0].id } } },
          { tag: { connect: { id: tags[2].id } } },
        ],
      },
      attachments: {
        create: [
          {
            type: AttachmentType.image,
            objectKey: 'attachments/sample/oil-spill.jpg',
            contentType: 'image/jpeg',
            bytes: 123456,
            thumbnailKey: 'attachments/sample/oil-spill-thumb.jpg',
          },
        ],
      },
    },
    include: { tags: true },
  })

  const report2 = await prisma.report.create({
    data: {
      title: 'Loose cable on walkway',
      body: 'Trip hazard spotted in the assembly area. Marked temporarily.',
      status: ReportStatus.in_progress,
      observedAt: now,
      geomType: GeomType.point,
      x: 2200,
      y: 1400,
      floor: { connect: { id: floor.id } },
      createdBy: { connect: { id: admin.id } },
      updatedBy: { connect: { id: admin.id } },
      tags: {
        create: [{ tag: { connect: { id: tags[1].id } } }],
      },
    },
  })

  // Audit logs
  await prisma.auditLog.createMany({
    data: [
      {
        reportId: report1.id,
        actorId: admin.id,
        action: AuditAction.create,
        diffJson: { title: report1.title, status: report1.status },
      },
      {
        reportId: report2.id,
        actorId: admin.id,
        action: AuditAction.create,
        diffJson: { title: report2.title, status: report2.status },
      },
    ],
  })

  console.log('Seed completed:', { admin: admin.email, floor: floor.name })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
