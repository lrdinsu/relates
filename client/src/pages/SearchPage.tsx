import { useEffect, useState } from 'react';

import { PostItem } from '@/features/posts/components/PostItem/PostItem.tsx';
import { Post } from '@/features/posts/hooks/usePostList.ts';
import {
  SearchUserItem,
  UserSearchResult,
} from '@/features/search/components/SearchUserItem.tsx';
import { SearchMode, useSearch } from '@/features/search/hooks/useSearch.ts';
import { useTitleStore } from '@/stores/titleStore.ts';
import {
  Box,
  Center,
  Divider,
  Loader,
  Stack,
  Tabs,
  Text,
  TextInput,
} from '@mantine/core';
import { useDebouncedValue, useIntersection } from '@mantine/hooks';
import { IconSearch } from '@tabler/icons-react';

import classes from './SearchPage.module.css';

export function SearchPage() {
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebouncedValue(query, 500);
  const [activeTab, setActiveTab] = useState<SearchMode>('users');
  const setTitle = useTitleStore((state) => state.setTitle);

  const {
    data,
    isPending,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useSearch(debouncedQuery, activeTab);

  const { ref, entry } = useIntersection({
    root: null,
    threshold: 1,
  });

  useEffect(() => {
    setTitle('Search');
  }, [setTitle]);

  useEffect(() => {
    if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [entry, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderResults = () => {
    if (!debouncedQuery.trim()) {
      return (
        <Center mt={100}>
          <Stack align="center" gap="xs">
            <IconSearch size={40} color="var(--mantine-color-dimmed)" />
            <Text c="dimmed">Search for users or posts</Text>
          </Stack>
        </Center>
      );
    }

    if (isPending) {
      return (
        <Center mt="xl">
          <Loader type="dots" />
        </Center>
      );
    }

    if (isError) {
      return (
        <Center mt="xl">
          <Text c="red">Error searching. Please try again.</Text>
        </Center>
      );
    }

    const allResults =
      data?.pages.reduce<(UserSearchResult | Post)[]>((acc, page) => {
        if ('users' in page) {
          return [...acc, ...page.users];
        }
        if ('posts' in page) {
          return [...acc, ...page.posts];
        }
        return acc;
      }, []) ?? [];

    if (allResults.length === 0) {
      return (
        <Center mt="xl">
          <Text c="dimmed">
            No results found for &#34;{debouncedQuery}&#34;
          </Text>
        </Center>
      );
    }

    return (
      <Stack gap={0} mt="md">
        {allResults.map((item, index) => {
          if (activeTab === 'users') {
            return (
              <Box key={(item as UserSearchResult).id}>
                <SearchUserItem user={item as UserSearchResult} />
                <Divider mx="md" />
              </Box>
            );
          } else {
            return (
              <PostItem
                key={(item as Post).id}
                post={item as Post}
                hideDivider={index === allResults.length - 1}
              />
            );
          }
        })}
        {hasNextPage && (
          <Center p="md" ref={ref}>
            <Loader type="dots" size="sm" />
          </Center>
        )}
      </Stack>
    );
  };

  return (
    <Stack gap={0}>
      <Box p="md" className={classes.searchHeader}>
        <TextInput
          placeholder="Search"
          size="md"
          radius="xl"
          leftSection={<IconSearch size={18} />}
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          className={classes.searchInput}
        />
      </Box>

      <Tabs
        value={activeTab}
        onChange={(value) => setActiveTab(value as SearchMode)}
        classNames={{
          list: classes.tabsList,
          tab: classes.tab,
        }}
      >
        <Tabs.List grow>
          <Tabs.Tab value="users">Profiles</Tabs.Tab>
          <Tabs.Tab value="posts">Posts</Tabs.Tab>
        </Tabs.List>

        <Box>{renderResults()}</Box>
      </Tabs>
    </Stack>
  );
}
