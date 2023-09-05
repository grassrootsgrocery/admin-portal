import { useMutation, useQuery } from "react-query";
import { Loading } from "../../components/Loading";
//Assets
import recruitment from "../../assets/recruitment.svg";
import { useAuth } from "../../contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { toastNotify } from "../../utils/ui";
import { ProcessedTextAutomation } from "../../types";
import { Popup } from "../../components/Popup";
import { MouseEventHandler } from "react";
import * as Modal from "@radix-ui/react-dialog";
import { SendTextMessageButton } from "../../components/SendTextMesssageButton";

// Tailwind classes
const sectionHeader =
  "flex items-start gap-3 text-2xl font-bold text-newLeafGreen lg:text-3xl";
const sectionHeaderIcon = "w-8 lg:w-10";
const recruitCard =
  "flex min-h-full min-w-fit grow flex-col gap-4 items-start lg:items-center";
const cardHeader = "text-xl lg:text-2xl font-semibold text-newLeafGreen";
const textArea =
  "grow overflow-scroll w-full resize-none rounded-md border-4 border-softGrayWhite py-2 px-4 text-base lg:text-xl";

export function Messaging() {
  const { token } = useAuth();
  if (!token) {
    return <Navigate to="/" />;
  }

  //Coordinators
  const coordinatorRecruitmentTextQuery = useQuery(
    ["fetchCoordinatorRecruitmentTextBlueprint"],
    async () => {
      const resp = await fetch(`/api/messaging/coordinator-recruitment-text`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!resp.ok) {
        const data = await resp.json();
        throw new Error(data.message);
      }
      return resp.json() as Promise<string>;
    }
  );

  //Volunteers
  const volunteerRecruitmentTextQuery = useQuery(
    ["fetchVolunteerRecruitmentTextBlueprint"],
    async () => {
      const resp = await fetch(`/api/messaging/volunteer-recruitment-text`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!resp.ok) {
        const data = await resp.json();
        throw new Error(data.message);
      }
      return resp.json() as Promise<string>;
    }
  );

  const volunteerTextLoading =
    volunteerRecruitmentTextQuery.status === "loading" ||
    volunteerRecruitmentTextQuery.status === "idle";

  const coordinatorTextLoading =
    coordinatorRecruitmentTextQuery.status === "loading" ||
    coordinatorRecruitmentTextQuery.status === "idle";

  //UI
  return (
    <div className="flex h-1/3 flex-col gap-4">
      <h1 className={sectionHeader}>
        <img className={sectionHeaderIcon} src={recruitment} alt="people" />
        Recruitment
      </h1>
      <div className="flex grow flex-col gap-16 md:flex-row lg:px-8">
        {/* Coordinators Recruitment card */}
        <div className={recruitCard}>
          <h2 className={cardHeader}>For Coordinators</h2>
          {coordinatorTextLoading ? (
            <div className="relative w-full grow rounded-md border-4 border-softGrayWhite py-2 px-4">
              <Loading size="medium" thickness="thicc" />
            </div>
          ) : (
            <textarea
              className={textArea}
              defaultValue={coordinatorRecruitmentTextQuery.data}
              readOnly
            />
          )}
          <SendTextMessageButton
            label={"Recruit Coordinators"}
            successMessage={"Coordinator recruitment text sent"}
            errorMessage={"Unable to send coordinator recruitment text"}
            url={`/api/messaging/coordinator-recruitment-text`}
            loading={coordinatorTextLoading}
          />
        </div>
        {/* Participants RecruitmentCard */}
        <div className={recruitCard}>
          <h2 className={cardHeader}>For Participants</h2>
          {volunteerTextLoading ? (
            <div className="relative w-full grow rounded-md border-4 border-softGrayWhite py-2 px-4">
              <Loading size="medium" thickness="thicc" />
            </div>
          ) : (
            <textarea
              className={textArea}
              defaultValue={volunteerRecruitmentTextQuery.data}
              readOnly
            />
          )}
          <SendTextMessageButton
            label={"Recruit Volunteers"}
            successMessage={"Volunteer recruitment text sent"}
            errorMessage={"Unable to send volunteer recruitment text"}
            url={`/api/messaging/volunteer-recruitment-text`}
            loading={volunteerTextLoading}
          />
        </div>
      </div>
    </div>
  );
}
