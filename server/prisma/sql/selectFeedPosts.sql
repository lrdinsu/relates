SELECT
  p.id,
  p."postedById",
  p."parentPostId",
  p.text,
  p.images,
  p."likesCount",
  p."commentsCount",
  p."repostsCount",
  p."isDeleted",
  p."createdAt",
  p."updatedAt",
  u.id AS "userId",
  u.username,
  u."profilePic"
FROM
  "Post" p
JOIN
  "User" u ON p."postedById" = u.id
WHERE
  p."postedById" = $1
  OR p."postedById" IN (
    SELECT "followingId"
    FROM "UserFollows"
    WHERE "followerId" = $1
  )
  AND ($2 = 0 OR p.id < $2)
ORDER BY
  p."createdAt" DESC
LIMIT
  $3;