type ApplicationLike = {
  is_unfinished?: boolean | null;
  email?: string | null;
  phone?: string | null;
};

type EnrollmentEmailLike = {
  applications?:
    | {
        email?: string | null;
      }
    | {
        email?: string | null;
      }[]
    | null;
};

export type ApplicationGroups<T = any> = {
  completedApplications: T[];
  abandonedDrafts: T[];
  unfinishedApplications: T[];
};

function getEnrolledEmailSet(enrollments: EnrollmentEmailLike[]): Set<string> {
  return new Set(
    enrollments
      .map((enrollment) => {
        const relation = enrollment.applications;
        if (Array.isArray(relation)) return relation[0]?.email?.toLowerCase();
        return relation?.email?.toLowerCase();
      })
      .filter((email): email is string => Boolean(email))
  );
}

export function splitApplicationsForAdmin(
  allApplications: any[],
  enrollments: EnrollmentEmailLike[]
): ApplicationGroups<any> {
  const enrolledEmails = getEnrolledEmailSet(enrollments);

  const completedApplications = allApplications.filter((app) => !app.is_unfinished);
  const unfinishedApplications = allApplications.filter((app) => app.is_unfinished);
  const abandonedDrafts = unfinishedApplications.filter((app) => {
    const hasContact = Boolean(app.email || app.phone);
    const enrolled = Boolean(app.email && enrolledEmails.has(app.email.toLowerCase()));
    return hasContact && !enrolled;
  });

  return {
    completedApplications,
    abandonedDrafts,
    unfinishedApplications,
  };
}
