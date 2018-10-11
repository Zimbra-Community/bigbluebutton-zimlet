CREATE TABLE `meetings` (
  `user` varchar(100) COLLATE utf8mb4_bin NOT NULL,
  `meetingID` varchar(40) COLLATE utf8mb4_bin NOT NULL,
  `attendeePW` varchar(50) COLLATE utf8mb4_bin NOT NULL,
  `moderatorPW` varchar(50) COLLATE utf8mb4_bin NOT NULL,
  `created` timestamp NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;


ALTER TABLE `meetings`
  ADD PRIMARY KEY (`meetingID`);

