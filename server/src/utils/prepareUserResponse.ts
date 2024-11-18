import { UserType } from 'validation';

export function prepareUserResponse(user: UserType) {
  const {
    id,
    name,
    email,
    username,
    profilePic,
    biography,
    followersCount,
    followingCount,
    createdAt,
  } = user;

  return {
    id,
    name,
    email,
    username,
    profilePic,
    biography,
    followingCount,
    followersCount,
    createdAt,
  };
}
