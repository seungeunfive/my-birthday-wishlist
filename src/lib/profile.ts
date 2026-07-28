import profileData from "@/src/data/profile.json";

type SiteProfile = {
  ownerName: string;
  bankAccount: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
};

const profile = profileData as SiteProfile;

export const { bankAccount, ownerName } = profile;
export const wishlistTitle = `${ownerName}의 생일 위시리스트`;
export const wishlistDescription = `${ownerName}의 생일 위시리스트에서 선물을 고르고 따뜻한 축하 메시지를 남겨주세요.`;
