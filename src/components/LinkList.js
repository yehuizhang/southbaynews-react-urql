import React, { useCallback, useMemo } from "react";
import Link from "./Link";
import { useQuery, useSubscription } from "urql";
import gql from "graphql-tag";

const ITEM_PER_PAGE = 5;

export const FEED_QUERY = gql`
  query FeedQuery($first: Int, $skip: Int, $orderBy: LinkOrderByInput) {
    feed(first: $first, skip: $skip, orderBy: $orderBy) {
      count
      links {
        id
        createdAt
        url
        description
        postedBy {
          id
          name
        }
        votes {
          id
          user {
            id
          }
        }
      }
    }
  }
`;

const NEW_VOTES_SUBSCRIPTION = gql`
  subscription {
    newVote {
      link {
        id
        votes {
          id
          user {
            id
          }
        }
      }
    }
  }
`;

const NEW_LINKS_SUBSCRIPTION = gql`
  subscription {
    newLink {
      id
      url
      description
      createdAt
      postedBy {
        id
        name
      }
      votes {
        id
        user {
          id
        }
      }
    }
  }
`;

const LinkList = props => {
  const isNewPage = props.location.pathname.includes("new");
  const page = parseInt(props.match.params.page, 10);
  const pageIndex = isNewPage ? (page - 1) * ITEM_PER_PAGE : 0;

  const variables = React.useMemo(
    () => ({
      skip: isNewPage ? (page - 1) * ITEM_PER_PAGE : 0,
      first: isNewPage ? ITEM_PER_PAGE : 100,
      orderBy: isNewPage ? "createdAt_DESC" : null
    }),
    [isNewPage, page]
  );

  const [result] = useQuery({
    query: FEED_QUERY,
    variables
    // requestPolicy: "cache-and-network"
  });
  useSubscription({ query: NEW_VOTES_SUBSCRIPTION });
  useSubscription({ query: NEW_LINKS_SUBSCRIPTION });

  const { data, fetching, error } = result;

  const nextPage = useCallback(() => {
    console.log(data.feed.count);
    if (page <= data.feed.count / ITEM_PER_PAGE) {
      props.history.push(`/new/${page + 1}`);
    }
  }, [props.history, data, page]);

  const previousPage = useCallback(() => {
    if (page > 1) {
      props.history.push(`/new/${page - 1}`);
    }
  }, [props.history, page]);

  const linksToRender = useMemo(() => {
    if (!data) {
      return [];
    } else if (isNewPage) {
      return data.feed.links;
    } else {
      const rankedLinks = data.feed.links
        .slice()
        .sort((l1, l2) => l2.votes.length - l1.votes.length);
      return rankedLinks;
    }
  }, [data, isNewPage]);

  if (fetching) return <div>Fetching</div>;
  if (error) return <div>Error</div>;

  return (
    <>
      <div>
        {linksToRender.map((link, index) => (
          <Link key={link.id} link={link} index={index + pageIndex} />
        ))}
      </div>
      {isNewPage && (
        <div className="flex ml4 mv3 gray">
          <div className="pointer mr2" onClick={previousPage}>
            Previous
          </div>
          <div className="pointer" onClick={nextPage}>
            Next
          </div>
        </div>
      )}
    </>
  );
};

export default LinkList;
