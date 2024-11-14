import { Link } from 'react-router-dom';

import { Button, Flex } from '@mantine/core';

function HomePage() {
  function handleClick() {
    fetch('/api/posts')
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  return (
    <>
      <Link to={'/kelliesmith'}>
        <Flex w={'100%'} align={'center'} justify={'center'}>
          <Button mx={'auto'}>Visit Profile Page</Button>
        </Flex>
      </Link>
      <button onClick={handleClick}>Click me</button>
    </>
  );
}

export default HomePage;
