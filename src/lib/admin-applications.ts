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

function isEnrolled(app: { id?: string | null; email?: string | null }, enrolledIds: Set<string>, enrolledEmails: Set<string>) {
  if (app.id && enrolledIds.has(app.id)) return true;
  const email = app.email?.toLowerCase();
  return Boolean(email && enrolledEmails.has(email));
}

export function splitApplicationsForAdmin(
  allApplications: any[],
  enrollments: Array<EnrollmentEmailLike & { application_id?: string | null }>
): ApplicationGroups<any> {
  const enrolledEmails = getEnrolledEmailSet(enrollments);
  const enrolledIds = new Set(
    enrollments.map((enrollment) => enrollment.application_id).filter((id): id is string => Boolean(id))
  );

  const abandonedDrafts = allApplications.filter((app) => {
    const hasContact = Boolean(app.email || app.phone);
    return app.is_unfinished && hasContact && !isEnrolled(app, enrolledIds, enrolledEmails);
  });
  const completedApplications = allApplications.filter(
    (app) => !app.is_unfinished && !isEnrolled(app, enrolledIds, enrolledEmails)
  );

  return {
    completedApplications,
    abandonedDrafts,
    unfinishedApplications: abandonedDrafts,
  };
}
