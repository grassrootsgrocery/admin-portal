import { useMutation, useQuery } from "react-query";
import { Loading } from "../../components/Loading";
import { API_BASE_URL } from "../../httpUtils";
//Assets
import recruitment from "../../assets/recruitment.svg";
import { useAuth } from "../../contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { toastNotify } from "../../uiUtils";

// Tailwind classes
const sectionHeader =
  "flex items-start gap-3 text-2xl font-bold text-newLeafGreen lg:text-3xl";
const sectionHeaderIcon = "w-8 lg:w-10";
const recruitCard =
  "flex min-h-full min-w-fit grow flex-col gap-4 items-start lg:items-center";
const cardHeader = "text-xl lg:text-2xl font-semibold text-newLeafGreen";
const textArea =
  "grow overflow-scroll w-full resize-none rounded-md border-4 border-softGrayWhite py-2 px-4 text-base lg:text-xl";
const btn =
  "rounded-full bg-pumpkinOrange px-3 py-2 text-sm font-semibold text-white shadow-md shadow-newLeafGreen transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-newLeafGreen lg:px-5 lg:py-3 lg:text-base lg:font-bold";

export function Messaging() {
  const { token } = useAuth();
  if (!token) {
    return <Navigate to="/" />;
  }

  //Coordinators
  const {
    data: coordinatorRecruitmentTextData,
    status: coordinatorRecruitmentTextStatus,
    error: coordinatorRecruitmentTextError,
  } = useQuery(["fetchCoordinatorRecruitmentTextBlueprint"], async () => {
    const resp = await fetch(
      `${API_BASE_URL}/api/messaging/coordinator-recruitment-text`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!resp.ok) {
      const data = await resp.json();
      throw new Error(data.message);
    }
    return resp.json();
  });

  const recruitCoordinators = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        `${API_BASE_URL}/api/messaging/coordinator-recruitment-text/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message);
      }

      return response.json();
    },
    onSuccess(data, variables, context) {
      toastNotify("Coordinator recruitment text automation started", "success");
    },
    onError(error, variables, context) {
      console.error(error);
      toastNotify("Unable to start text automation", "failure");
    },
  });

  //Volunteers
  const {
    data: volunteerRecruitmentTextData,
    status: volunteerRecruitmentTextStatus,
    error: volunteerRecruitmentTextError,
  } = useQuery(["fetchVolunteerRecruitmentTextBlueprint"], async () => {
    const resp = await fetch(
      `${API_BASE_URL}/api/messaging/volunteer-recruitment-text`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!resp.ok) {
      const data = await resp.json();
      throw new Error(data.message);
    }
    return resp.json();
  });

  const recruitVolunteers = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        `${API_BASE_URL}/api/messaging/volunteer-recruitment-text`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message);
      }

      return response.json();
    },
    onSuccess(data, variables, context) {
      toastNotify("Volunteer recruitment text automation started", "success");
    },
    onError(error, variables, context) {
      console.error(error);
      toastNotify("Unable to start text automation", "failure");
    },
  });

  const volunteerTextLoading =
    volunteerRecruitmentTextStatus === "loading" ||
    volunteerRecruitmentTextStatus === "idle";

  const coordinatorTextLoading =
    coordinatorRecruitmentTextStatus === "loading" ||
    coordinatorRecruitmentTextStatus === "idle";

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
              defaultValue={coordinatorRecruitmentTextData}
              readOnly
            />
          )}
          <button className={btn} onClick={() => recruitCoordinators.mutate()}>
            Recruit Coordinators
          </button>
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
              defaultValue={volunteerRecruitmentTextData}
              readOnly
            />
          )}
          <button className={btn} onClick={() => recruitVolunteers.mutate()}>
            Recruit Participants
          </button>
        </div>
      </div>
    </div>
  );
}
