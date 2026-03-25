import { SideBarMenuItemType } from "../../store/store";
import {
  DashboardIcon,
  AccountCircleIcon,
  CheckCircleIcon,
  GroupIcon,
  MonetizationOnIcon,
  ShowChartIcon,
  CreditCardIcon,
  MailOutlineIcon,
  PersonIcon,
  VerifiedUserIcon,
  LockIcon,
  PeopleIcon,
  AccountTreeIcon,
  PersonAddIcon,
  TrendingUpIcon,
  PaymentsIcon,
  SupportIcon,
  AnnouncementIcon,
  EventIcon,
  SmsIcon,
} from "../Icons";
import { CardMembershipRounded, Pending } from "@mui/icons-material";

export const UserSideBarMenuItems: SideBarMenuItemType[] = [
  {
    name: "Dashboard",
    icon: <DashboardIcon />,
    path: "/user/dashboard",
    isExpandable: false,
  },
  {
    name: "Account Info",
    icon: <AccountCircleIcon />,
    isExpandable: true,
    subItems: [
      { name: "Profile", path: "/user/account/profile", icon: <PersonIcon /> },
      { name: "KYC", path: "/user/account/kyc", icon: <VerifiedUserIcon /> },
      {
        name: "Change Password",
        path: "/user/account/change-password",
        icon: <LockIcon />,
      },
    ],
  },
  {
    name: "Team",
    icon: <GroupIcon />,
    isExpandable: true,
    subItems: [
      { name: "Direct", path: "/user/team/direct", icon: <PeopleIcon /> },
      { name: "Team", path: "/user/team", icon: <GroupIcon /> },
      { name: "Tree", path: "/user/team/tree", icon: <AccountTreeIcon /> },
      {
        name: "New Register",
        path: "/user/team/new-register",
        icon: <PersonAddIcon />,
      },
    ],
  },
  {
    name: "Earnings",
    icon: <MonetizationOnIcon />,
    isExpandable: true,
    subItems: [
      {
        name: "Level Benefits",
        path: "/user/earnings/level-benefits",
        icon: <TrendingUpIcon />,
      },
      {
        name: "Daily ROI",
        path: "/user/earnings/daily-payout",
        icon: <PaymentsIcon />,
      },
    ],
  },
  {
    name: "Transactions",
    icon: <ShowChartIcon />,
    path: "/user/transactions",
    isExpandable: false,
  },
  /* Sub-menus collapsed into single Transactions link above
  {
    name: "Transactions",
    icon: <ShowChartIcon />,
    isExpandable: true,
    subItems: [
      { name: "RD Deposit", path: "/user/transactions", icon: <CreditCardIcon /> },
      { name: "Loan", path: "/user/loantransactions", icon: <AccountBalance /> },
    ],
  },
  */
  {
    name: "Wallet Balance",
    icon: <CreditCardIcon />,
    path: "/user/wallet",
    isExpandable: false,
  },
  {
    name: "Mail Box",
    icon: <MailOutlineIcon />,
    path: "/user/mailbox",
    isExpandable: false,
  },

];


export const AdminSideBarMenuItems: SideBarMenuItemType[] = [
  {
    name: "Dashboard",
    icon: <DashboardIcon />,
    path: "/admin/dashboard",
    isExpandable: false,
  },
  {
    name: "Members",
    icon: <GroupIcon />,
    isExpandable: true,
    subItems: [
      { name: "Members", path: "/admin/members", icon: <PeopleIcon /> },
      {
        name: "Pending Members",
        path: "/admin/members/pending",
        icon: <PersonAddIcon />,
      },
      {
        name: "Active Members",
        path: "/admin/members/active",
        icon: <CheckCircleIcon />,
      },
      {
        name: "Inactive Members",
        path: "/admin/members/inactive",
        icon: <PersonIcon />,
      },
      {
        name: "KYC Approval",
        path: "/admin/kyc-approval",
        icon: <VerifiedUserIcon />,
      },
    ],
  },

  //   name: "Package",
  //   icon: <InventoryIcon />,
  //   isExpandable: true,
  //   subItems: [
  //     {
  //       name: "Generate Package",
  //       path: "/admin/package/generate",
  //       icon: <RequestQuoteIcon />,
  //     },
  //     {
  //       name: "Package Request",
  //       path: "/admin/package/requests",
  //       icon: <ReceiptLongIcon />,
  //     },
  //     {
  //       name: "Used Package",
  //       path: "/admin/package/used",
  //       icon: <InventoryIcon />,
  //     },
  //     {
  //       name: "Unused Package",
  //       path: "/admin/package/unused",
  //       icon: <InventoryIcon />,
  //     },
  //     {
  //       name: "Package History",
  //       path: "/admin/package/history",
  //       icon: <HistoryIcon />,
  //     },
  //   ],

  {
    name: "Incomes",
    icon: <MonetizationOnIcon />,
    isExpandable: true,
    subItems: [
      {
        name: "Cash Back",
        path: "/admin/income/cashback",
        icon: <PaymentsIcon />,
      },
      {
        name: "Level Benefits",
        path: "/admin/income/level-benefits",
        icon: <TrendingUpIcon />,
      },
      {
        name: "Daily ROI",
        path: "/admin/income/daily-payouts",
        icon: <PaymentsIcon />,
      },
    ],
  },



  {
    name: "Loans",
    icon: <CreditCardIcon />,
    isExpandable: true,
    subItems: [
      {
        name: "Loan Pending",
        path: "/admin/member/pending",
        icon: <Pending />
      },
      {
        name: " Loan Processed",
        path: "/admin/member/processed",
        icon: <CardMembershipRounded />
      },

    ],
  },
  {
    name: "Repayments",
    icon: <PaymentsIcon />,
    isExpandable: true,
    subItems: [
      {
        name: "Repayments List",
        path: "/admin/repayments/list",
        icon: <PaymentsIcon />
      },
    ],
  },


  {
    name: "Payout",
    icon: <CreditCardIcon />,
    path: "/admin/payout",
    isExpandable: false,
  },
  {
    name: "Withdraw Requests",
    icon: <Pending />,
    path: "/admin/withdraw-pending",
    isExpandable: false,
  },
  {
    name: "Transactions",
    icon: <ShowChartIcon />,
    isExpandable: true,
    subItems: [
      {
        name: "Transactions",
        path: "/admin/transactions",
        icon: <ShowChartIcon />,
      },
      {
        name: "SMS Transactions",
        path: "/admin/transactions/sms",
        icon: <SmsIcon />,
      },
    ],
  },
  {
    name: "Support Tickets",
    path: "/admin/support-tickets",
    icon: <SupportIcon />,
    isExpandable: false,
  },
  {
    name: "News",
    path: "/admin/news",
    icon: <AnnouncementIcon />,
    isExpandable: false,
  },
  {
    name: "Holidays",
    path: "/admin/holidays",
    icon: <EventIcon />,
    isExpandable: false,
  },

];

