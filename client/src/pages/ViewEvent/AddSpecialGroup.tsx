import { useMutation, useQuery } from "react-query";
import { API_BASE_URL } from "../../httpUtils";
import { AddSpecialGroupRequestBody, ProcessedSpecialGroup } from "../../types";
import { SpecialGroupDropdown } from "../../components/SpecialGroupDropdown";
import Popup from "../../components/Popup";
import { Loading } from "../../components/Loading";
import { useState } from "react";
interface Props {}

export const AddSpecialGroup: React.FC<Props> = () => {
  // Retrieve Special Groups
  const {
    data: specialGroups,
    refetch: refetchGroups,
    status: specialGroupsStatus,
    error: specialGroupsError,
  } = useQuery(["fetchSpecialGroups"], async () => {
    const response = await fetch(`${API_BASE_URL}/api/special-groups`);
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message);
    }
    return response.json() as Promise<ProcessedSpecialGroup[]>;
  });
  const createSpecialGroup = async (data: AddSpecialGroupRequestBody) => {
    const response = await fetch(`${API_BASE_URL}/api/add-special-group`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message);
    }

    return response.json();
  };
  const { mutate, isLoading } = useMutation(createSpecialGroup, {
    onSuccess: (data) => {
      console.log(data); // the response
    },
    onError: (error) => {
      console.log(error); // the error if that is the case
    },
  });

  const [group, setGroup] = useState("");
  const [id, setId] = useState("");
  const [registered, setRegistered] = useState(false);

  if (specialGroupsStatus === "loading" || specialGroupsStatus === "idle") {
    return (
      <div className="relative h-full">
        <Loading size="large" thickness="extra-thicc" />
      </div>
    );
  }

  if (specialGroupsStatus === "error") {
    console.error(specialGroupsError);
    return <div>Error...</div>;
  }

  console.log("Logging specialGroups", specialGroups);

  const specialGroupsList: ProcessedSpecialGroup[] = specialGroups;
  const handleRegistered = (value: boolean) => {
    setRegistered(value);
  };

  const close = () => {
    setGroup("");
    setRegistered(false);
  };

  const handleQuery = (query: string) => {
    setGroup(query);
  };

  const handleId = (id: string) => {
    setId(id);
  };

  // Retrieve Special Groups
  const addGroup = () => {
    const results = specialGroupsList.filter((g) => {
      return g.name === group;
    });

    if (results.length === 0) {
      console.log("Creating new group");
      const body: AddSpecialGroupRequestBody = {
        Name: group,
      };
      mutate(body);
    } else {
      const results = specialGroupsList.filter((g) => {
        return g.name === group;
      });
    }
  };

  // Special group link popup
  const linkTitle = <div className="text-center">Special Group Link</div>;
  const noLinkTitle = (
    <div className="text-center">
      Cannot generate link because group is already registered!
    </div>
  );

  const linkTrigger = (
    <div>
      <button
        onClick={() => addGroup()}
        disabled={group ? false : true}
        className="rounded-full bg-newLeafGreen px-3 py-2 text-sm font-semibold text-white shadow-md shadow-newLeafGreen hover:-translate-y-1 hover:shadow-lg hover:shadow-newLeafGreen lg:px-5 lg:py-3 lg:text-base lg:font-bold"
        type="button"
      >
        Add Group and Generate Link
      </button>
    </div>
  );

  const linkContent = (
    <div>
      <p>{group}</p>
    </div>
  );

  const getNextButton = () => {
    if (!registered) {
      return (
        <div>
          <Popup
            title={linkTitle}
            trigger={linkTrigger}
            content={linkContent}
            renderLittleXCloseButton
            next={<div>next</div>}
            // noCancel
          />
        </div>
      );
    }

    return (
      <div>
        <Popup
          title={noLinkTitle}
          trigger={linkTrigger}
          content="Jason"
          renderLittleXCloseButton
          // noCancel
          next={<div>next</div>}
        />
      </div>
    );
  };

  return (
    <Popup
      trigger={
        <button
          className="rounded-full bg-pumpkinOrange px-3 py-2 text-sm font-semibold text-white shadow-md shadow-newLeafGreen outline-none transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-newLeafGreen lg:px-5 lg:py-3 lg:text-base lg:font-bold"
          type="button"
        >
          + Add Special Group
        </button>
      }
      title={
        <div className="b m-0 flex justify-center font-bold text-newLeafGreen lg:text-3xl">
          Add Special Group to Event
        </div>
      }
      content={
        <div>
          <div className="r flex h-72 justify-center gap-5">
            <p className="font-bold text-newLeafGreen lg:text-xl">
              Group Name:
            </p>
            <SpecialGroupDropdown
              handleQuery={handleQuery}
              handleRegistered={handleRegistered}
              specialGroupsList={specialGroups}
              refetchGroups={refetchGroups}
            />
          </div>
        </div>
      }
      renderLittleXCloseButton
      next={getNextButton()}
    />
  );
};
