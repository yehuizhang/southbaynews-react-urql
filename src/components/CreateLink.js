import React, { useState, useCallback } from "react";
import { useMutation } from "urql";
import gql from "graphql-tag";

const POST_MUTATION = gql`
  mutation PostMutation($url: String!, $description: String!) {
    post(url: $url, description: $description) {
      id
      createdAt
      description
      url
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

const CreateLink = () => {
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [state, executeMutation] = useMutation(POST_MUTATION);

  const submit = useCallback(() => {
    executeMutation({ url, description });
  }, [executeMutation, url, description]);

  return (
    <div>
      <div className="flex flex-column mt3">
        <input
          className="mb2"
          type="text"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="A description for the link"
        />
        <input
          className="mb2"
          type="text"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="The URL for the link"
        />
      </div>
      <button onClick={submit} disabled={state.fetching}>
        Submit
      </button>
    </div>
  );
};

export default CreateLink;
