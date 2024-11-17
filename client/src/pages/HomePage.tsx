import { Link } from 'react-router-dom';

import { PostList } from '@/features/posts/PostList/PostList.tsx';
import { Button, Flex } from '@mantine/core';

function HomePage() {
  return (
    <>
      <Link to={'/kelliesmith'}>
        <Flex w={'100%'} align={'center'} justify={'center'}>
          <Button mx={'auto'}>Visit Profile Page</Button>
        </Flex>
      </Link>
      <PostList />
    </>
  );
}

export default HomePage;
