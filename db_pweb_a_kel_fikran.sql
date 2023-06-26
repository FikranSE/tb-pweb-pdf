-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 07 Jun 2023 pada 05.42
-- Versi server: 10.4.28-MariaDB
-- Versi PHP: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `db_pweb_a_kel_fikran`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `enrollments`
--

CREATE TABLE `enrollments` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `enroll_key` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `enrollments`
--

INSERT INTO `enrollments` (`id`, `user_id`, `enroll_key`) VALUES
(1, 2, 'bdsOdG'),
(2, 2, '1eVjZb'),
(3, 2, '1yBPo9');

-- --------------------------------------------------------

--
-- Struktur dari tabel `forms`
--

CREATE TABLE `forms` (
  `form_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(100) NOT NULL,
  `description` varchar(255) NOT NULL,
  `enroll_key` varchar(10) NOT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `forms`
--

INSERT INTO `forms` (`form_id`, `user_id`, `title`, `description`, `enroll_key`, `created_at`, `updated_at`) VALUES
(1, 1, 'pemogramman web', 'buat database dengan intruksi berikut : \r\n  1. database : pweb_a\r\n 2. tabel 1 : users\r\n 3. tabel 2 : forms\r\n4. tabel 3 : submissions', 'bdsOdG', '2023-06-07 02:24:07.240230', '2023-06-07 02:24:07.240230'),
(2, 3, 'Latihan Kalkulus', 'Jawab soal 1 sampai 20 yang ada di ppt yang telah dibagikan di grup WA pada ketas HVS', '1eVjZb', '2023-06-07 02:41:42.705965', '2023-06-07 02:41:42.705965'),
(3, 3, 'damin', 'kerjakan intruksi', '1yBPo9', '2023-06-07 03:23:40.613903', '2023-06-07 03:23:40.613903');

-- --------------------------------------------------------

--
-- Struktur dari tabel `submissions`
--

CREATE TABLE `submissions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `form_id` int(11) NOT NULL,
  `uploaded_file` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `submissions`
--

INSERT INTO `submissions` (`id`, `user_id`, `form_id`, `uploaded_file`, `description`, `created_at`, `updated_at`) VALUES
(1, 2, 1, '1686105350045-db_sign (1).sql', 'mohon diterima pak', '2023-06-07 02:35:50.062882', '2023-06-07 02:35:50.062882'),
(2, 2, 2, '1686106045013-Timeline Pembukaan.pdf', 'dah siaap!!', '2023-06-07 02:47:25.042487', '2023-06-07 02:47:25.042487'),
(3, 2, 3, '1686108257084-2111521024_Fikran Shadiq Elyafit_InstruksiModulKe-11.ipynb', 'maaf telat', '2023-06-07 03:24:17.104981', '2023-06-07 03:24:17.104981');

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `active` int(2) NOT NULL,
  `avatar` varchar(255) NOT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`user_id`, `username`, `email`, `password`, `active`, `avatar`, `created_at`, `updated_at`) VALUES
(1, 'admin', '', '$2b$10$polCr2b/dTRjamMGYaWSxeC1Jt4FshAYMs/TP1ofzWUX4wpP1.bcO', 0, '', '2023-06-07 02:22:03.880817', '2023-06-07 02:22:03.880817'),
(2, 'fikran', 'fikranelyafit@gmail.com', '$2b$10$wOMK4JnoEMfkfKJu8DLvle07u7yLUIZYPhj4AggRw0ssQdUpGrgGW', 0, '1686105428084-2.jpg', '2023-06-07 02:25:08.613496', '2023-06-07 02:25:08.613496'),
(3, 'Ilham', 'ilham19@gmail.com', '$2b$10$5yamV6qwL/p5VLxIvKntSuOjJkOOwxaTb5RN7EsFXYNaVp1Ir4fjO', 0, '1686105622639-ilham.jpeg', '2023-06-07 02:38:22.130918', '2023-06-07 02:38:22.130918');

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `enrollments`
--
ALTER TABLE `enrollments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indeks untuk tabel `forms`
--
ALTER TABLE `forms`
  ADD PRIMARY KEY (`form_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indeks untuk tabel `submissions`
--
ALTER TABLE `submissions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `form_id` (`form_id`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `enrollments`
--
ALTER TABLE `enrollments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT untuk tabel `forms`
--
ALTER TABLE `forms`
  MODIFY `form_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT untuk tabel `submissions`
--
ALTER TABLE `submissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `enrollments`
--
ALTER TABLE `enrollments`
  ADD CONSTRAINT `enrollments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Ketidakleluasaan untuk tabel `forms`
--
ALTER TABLE `forms`
  ADD CONSTRAINT `forms_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Ketidakleluasaan untuk tabel `submissions`
--
ALTER TABLE `submissions`
  ADD CONSTRAINT `submissions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `submissions_ibfk_2` FOREIGN KEY (`form_id`) REFERENCES `forms` (`form_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
