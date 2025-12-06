import { api } from "@/utils/api";

export const login = async function ({
  partyIdentifier,
}: {
  partyIdentifier: string;
}) {
  const res = await api.post("/api/login", {
    partyIdentifier,
  });

  return res.data;
};
export const register = async function ({
  partyHint,
  firstName,
  lastName,
}: {
  partyHint: string;
  firstName: string;
  lastName: string;
}) {
  const res = await api.post("/api/register", {
    partyHint,
    firstName,
    lastName,
  });

  return res.data;
};
