import decrypt from "./decrypt";

export const exportPasswordsToJson = (
  passwords: Noonly.API.Data.Account[]
): void => {
  const exports: Noonly.API.Data.Account[] = [];
  passwords.forEach((pw) => {
    exports.push({
      ...pw,
      password: decrypt(pw.password),
      note: decrypt(pw.note),
      mfaSecret: pw.mfaSecret ? decrypt(pw.mfaSecret) : "",
    });
  });
  const file = JSON.stringify(exports, null, 2);
  const blob = new Blob([file], { type: "text/plain" });
  const anchorElement = document.createElement("a");
  anchorElement.href = URL.createObjectURL(blob);
  anchorElement.download = "noonly-accounts.json";
  anchorElement.click();
  URL.revokeObjectURL(anchorElement.href);
};

export const exportPasswordsBitwarden = (
  passwords: Noonly.API.Data.Account[]
): void => {
  const exports: any[] = [];
  passwords.forEach((pw) => {
    exports.push({
      id: pw.id,
      organizationId: null,
      folderId: null,
      type: 1,
      reprompt: 0,
      name: pw.site,
      notes: decrypt(pw.note),
      favorite: false,
      fields: [],
      login: {
        uris: [
          {
            match: null,
            uri: pw.site,
          },
        ],
        username: pw.address ? pw.address : pw.username,
        password: decrypt(pw.password),
        totp: pw.mfaSecret ? decrypt(pw.mfaSecret) : null,
      },
      collectionIds: null,
    });
  });
  const bitwarden = {
    items: exports,
  };
  const file = JSON.stringify(bitwarden, null, 2);
  const blob = new Blob([file], { type: "text/plain" });
  const anchorElement = document.createElement("a");
  anchorElement.href = URL.createObjectURL(blob);
  anchorElement.download = "noonly-accounts-bitwarden-format.json";
  anchorElement.click();
  URL.revokeObjectURL(anchorElement.href);
};
