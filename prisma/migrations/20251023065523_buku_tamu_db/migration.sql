-- CreateTable
CREATE TABLE `buku_tamu` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(255) NOT NULL,
    `alamat` TEXT NOT NULL,
    `instansi` VARCHAR(255) NOT NULL,
    `keperluan` TEXT NOT NULL,
    `fotoUrl` VARCHAR(500) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
