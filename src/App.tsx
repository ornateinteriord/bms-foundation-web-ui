import { Suspense, lazy } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import "./App.css";
import "./index.css";
import { Dialog, DialogContent, CircularProgress } from "@mui/material";
import DashboardBg from "./assets/dashboard_bg.jpg";

import Members, {
  ActiveMembers,
  InActiveMembers,
  PendingMembers,
} from "./pages/Admin-Pages/Members/Members";
import {
  GeneratePackages,
  PackageHistory,
  PackageRequests,
  UnusedPackages,
  UsedPackages,
} from "./pages/Admin-Pages/Packages/Packages";
import KYCApproval from "./pages/Admin-Pages/KYCApproval/KYCApproval";
import Tree from "./pages/User-Pages/Team/Tree";
import Team from "./pages/User-Pages/Team/Team";
import ProtectedRoute from "./routeProtecter/RouteProtecter";
import useAuth from "./hooks/use-auth";
import PublicRoute from "./routeProtecter/PublicRoutes";
import UserProvider from "./context/user/userContextProvider";
import MembersUpdateForm from "./pages/Admin-Pages/UpdateForms";
import ChatNotificationListener from "./components/Chat/ChatNotificationListener";
import MobileBottomNav from "./components/common/MobileBottomNav";






// public pages
// const Home = lazy(() => import("./pages/Home/Home"));
const Login = lazy(() => import("./pages/Auth/Login"));
const Register = lazy(() => import("./pages/Auth/Register"));
const RecoverPassword = lazy(() => import("./pages/Auth/RecoverPassword"))
const ResetPassword = lazy(() => import("./pages/Auth/ResetPassword"))
const Navbar = lazy(() => import("./pages/Navbar/Navbar"));
const NotFound = lazy(() => import("./pages/not-found/NotFound"));
const Footer = lazy(() => import("./components/Footer/Footer"));
const About = lazy(() => import("./pages/About/About"));
const Contact = lazy(() => import("./pages/Contact/Contact"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy/PrivacyPolicy"));
const Terms = lazy(() => import("./pages/Terms/Terms"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy/RefundPolicy"));

// admin pages
const UpdatePassword = lazy(() => import("./pages/Admin-Pages/admin-panel/UpdatePassword"));
const AdminDashboard = lazy(
  () => import("./pages/Admin-Pages/AdminDashboard/Dashboard")
);
const AdminCashBack = lazy(
  () => import("./pages/Admin-Pages/Incomes/CashBack")
);
const AdminDailyBenifitsPayouts = lazy(
  () => import("./pages/Admin-Pages/Incomes/DailyBenifitsPayouts")
);
const AdminLevelBenifits = lazy(
  () => import("./pages/Admin-Pages/Incomes/LevelBenifits")
);
const AdminROIBenefits = lazy(
  () => import("./pages/Admin-Pages/Incomes/ROIBenifits")
);

const AdminPayout = lazy(() => import("./pages/Admin-Pages/Payout/Payout"));

const AdminTransactions = lazy(
  () => import("./pages/Admin-Pages/Transactions/Transactions")
);
const AdminSMSTransactions = lazy(
  () => import("./pages/Admin-Pages/Transactions/SMS-Transactions")
);
const AdminSupportTickets = lazy(
  () => import("./pages/Admin-Pages/SupportTicket/SupportTickets")
);
const AdminNews = lazy(() => import("./pages/Admin-Pages/News/News"));
const AdminHolidays = lazy(
  () => import("./pages/Admin-Pages/Holidays/Holidays")
);
const WithdrawPending = lazy(() => import("./pages/Admin-Pages/WithdrawPending/WithdrawPending"));
// const Activate = lazy(() => import("./pages/Admin-Pages/Activate/Activate"));
// const ActivatePackage = lazy(() => import("./pages/Admin-Pages/activatePackage/ActivatePackage"));

const AdminAddOnRequests = lazy(() => import("./pages/Admin-Pages/Packages/AdminAddOnRequests"));
const AdminChat = lazy(() => import("./pages/Admin-Pages/AdminChat/AdminChat"));


// user pages
const UserDashboard = lazy(
  () => import("./pages/User-Pages/UserDashboard/Dashboard")
);
const UserAddOnPackages = lazy(() => import("./pages/User-Pages/Packages/UserAddOnPackages"));
const UserPackageHistory = lazy(
  () => import("./pages/User-Pages/Packages/PackageHistory")
);
const UserTransaction = lazy(
  () => import("./pages/User-Pages/Transaction/WalletTransaction")
);
const UserLoanTransaction = lazy(
  () => import("./pages/User-Pages/Transaction/LoanTransaction")
);
const UserMailBox = lazy(() => import("./pages/User-Pages/MailBox/MailBox"));
const UserProfile = lazy(() => import("./pages/User-Pages/Profile/Profile"));
const UserKYC = lazy(() => import("./pages/User-Pages/KYC/KYC"));
const UserChangePassword = lazy(
  () => import("./pages/User-Pages/Change-Password/ChangePassword")
);
const UserActivate = lazy(() => import("./pages/User-Pages/Activate/Activate"));
const UserNewResgister = lazy(
  () => import("./pages/User-Pages/Team/NewResgister")
);
const UserUsedPackage = lazy(
  () => import("./pages/User-Pages/Packages/UsedPackage")
);
const UserUnUsedPackage = lazy(
  () => import("./pages/User-Pages/Packages/UnUsedPackage")
);
const UserTransferPackage = lazy(
  () => import("./pages/User-Pages/Packages/TransferPackage")
);
const UserDirect = lazy(() => import("./pages/User-Pages/Team/Direct"));
const UserLevelBenifits = lazy(
  () => import("./pages/User-Pages/Earnings/LeveBenifits")
);
const UserDailyPayout = lazy(
  () => import("./pages/User-Pages/Earnings/DailyPayout")
);
const UserROIBenefits = lazy(
  () => import("./pages/User-Pages/Earnings/ROIBenefits")
);
const UserWallet = lazy(() => import("./pages/User-Pages/Wallet/Wallet"));
const UserSupportChat = lazy(() => import("./pages/User-Pages/SupportChat/SupportChat"));
const UserChat = lazy(() => import("./pages/User-Pages/Chat/Chat"));



const LoansMemberPending = lazy(() => import("./pages/Loans/Loanspending/Pending"));
const LoansMemberProcessed = lazy(() => import("./pages/Loans/Loansprocesssed/Processed"));
const LoansRepaymentsList = lazy(() => import("./pages/Loans/Repaymentlist/LoansList"));
// const LoansRepaymentsPlaceholder = lazy(() => import("./pages/Loans/Repayments/RepaymentPlaceholder"));

export const LoadingComponent = () => {
  return (
    <Dialog open={true}>
      <DialogContent>
        <CircularProgress />
      </DialogContent>
    </Dialog>
  );
};

const ShouldHideSidebarComponent = () => {
  const location = useLocation();
  const publicPaths = [
    "/",
    "/login",
    "/register",
    "/recover-password",
    "/reset-password",
    "/about",
    "/contact",
    "/privacy-policy",
    "/terms",
    "/refund-policy"
  ];
  return publicPaths.includes(location.pathname);
};

const ShouldShowFooter = () => {
  const location = useLocation();
  const noFooterPaths: string[] = [];
  return !noFooterPaths.includes(location.pathname);
};

const IsDashboardPage = () => {
  const location = useLocation();
  const dashboardPaths = ["/user/dashboard", "/admin/dashboard"];
  return dashboardPaths.includes(location.pathname);
};

function App() {
  const queryClient = new QueryClient();

  return (
    <UserProvider>
      <QueryClientProvider client={queryClient}>
        <ToastContainer
          toastClassName="bg-white shadow-lg rounded-lg p-4"
          className="text-sm text-gray-800"
          style={{ width: 'auto', minWidth: '25rem' }} />
        <Router>
          <Suspense fallback={<LoadingComponent />}>

            <RoutesProvider />
          </Suspense>
        </Router>
      </QueryClientProvider>
    </UserProvider>
  );
}

const RoutesProvider = () => {
  const shouldHide = ShouldHideSidebarComponent();
  const isDashboard = IsDashboardPage();
  const shouldShowFooter = ShouldShowFooter();
  const { userRole } = useAuth()

  return (
    <>
      <Navbar />
      <ChatNotificationListener />

      <div
        style={{
          display: "flex",
          maxWidth: "100vw",
          overflowX: "hidden",
          backgroundImage: isDashboard ? `url(${DashboardBg})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
          minHeight: "100vh"
        }}
      >
        {/* {!shouldHide && (
          <Sidebar
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            role={userRole}
          />
        )} */}
        <div
          style={{
            flex: 1,
            // marginLeft: !shouldHide && isOpen ? "250px" : "0",
            marginLeft: "0",
            transition: "margin-left 0.3s ease-in-out",
            width: "100%",
            overflowX: "hidden",
            backgroundColor: isDashboard ? "transparent" : "#f4f7f9",
            minHeight: "calc(100vh - 64px)"
          }}
        >
          <Routes>
            {/* public routes */}
            <Route element={<PublicRoute />}>
              <Route index element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/recover-password" element={<RecoverPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
            </Route>
            {/* policy and info pages - accessible to all */}
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            {/* admin routes */}

            <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
              <Route path="/admin/update-password" element={<UpdatePassword />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />{" "}
              {/* admin member routes */}
              <Route path="/admin/members" element={<Members />} />


              <Route
                path="/admin/members/pending"
                element={<PendingMembers />}
              />
              {/* <Route path="/admin/Activate" element={<Activate />} />
              <Route path="/admin/ActivatePackage" element={<ActivatePackage />} /> */}
              <Route path="/admin/members/active" element={<ActiveMembers />} />
              <Route
                path="/admin/members/inactive"
                element={<InActiveMembers />}
              />
              
              {/* admin addon routes */}
              <Route path="/admin/addon-approvals" element={<AdminAddOnRequests />} />

              {/* admin package routes */}
              <Route
                path="/admin/package/generate"
                element={<GeneratePackages />}
              />
              <Route
                path="/admin/package/requests"
                element={<PackageRequests />}
              />
              <Route path="/admin/package/used" element={<UsedPackages />} />
              <Route
                path="/admin/package/unused"
                element={<UnusedPackages />}
              />
              <Route
                path="/admin/package/history"
                element={<PackageHistory />}
              />
              {/* admin income routes */}
              <Route
                path="/admin/income/cashback"
                element={<AdminCashBack />}
              />
              <Route
                path="/admin/income/level-benefits"
                element={<AdminLevelBenifits />}
              />
              <Route
                path="/admin/income/daily-payouts"
                element={<AdminDailyBenifitsPayouts />}
              />
              <Route
                path="/admin/income/roi-benefits"
                element={<AdminROIBenefits />}
              />

              <Route path="/admin/payout" element={<AdminPayout />} />

              {/* admin transaction routes */}
              <Route
                path="/admin/transactions"
                element={<AdminTransactions />}
              />
              <Route
                path="/admin/transactions/sms"
                element={<AdminSMSTransactions />}
              />
              <Route
                path="/admin/support-tickets"
                element={<AdminSupportTickets />}
              />
              <Route path="/admin/news" element={<AdminNews />} />
              <Route path="/admin/holidays" element={<AdminHolidays />} />
              <Route path="/admin/members/:memberId" element={<MembersUpdateForm />} />
               <Route path="/admin/kyc-approval" element={<KYCApproval />} />
              <Route path="/admin/withdraw-pending" element={<WithdrawPending />} />
              <Route path="/admin/chat" element={<AdminChat />} />



            </Route>
            <Route element={<ProtectedRoute allowedRoles={["ADMIN", "USER"]} />}>
              <Route path="/admin/member/pending" element={<LoansMemberPending />} />
              <Route path="/admin/member/processed" element={<LoansMemberProcessed />} />
              <Route path="/admin/repayments/list" element={<LoansRepaymentsList />} />
              {/* <Route path="/loans/repayments/placeholder" element={<LoansRepaymentsPlaceholder />} /> */}
            </Route>

            {/* user routes */}

            <Route element={<ProtectedRoute allowedRoles={["USER"]} />}>
              <Route path="/user/dashboard" element={<UserDashboard />} />
              {/* user account routes */}
              <Route path="/user/account/profile" element={<UserProfile />} />
              <Route path="/user/account/kyc" element={<UserKYC />} />
              <Route
                path="/user/account/change-password"
                element={<UserChangePassword />}
              />
              <Route path="/user/activate" element={<UserActivate />} />
              {/* package routes */}
              <Route path="/user/addon-packages" element={<UserAddOnPackages />} />
              <Route path="/user/package/used" element={<UserUsedPackage />} />
              <Route
                path="/user/package/unused"
                element={<UserUnUsedPackage />}
              />
              <Route
                path="/user/package/transfer"
                element={<UserTransferPackage />}
              />
              <Route
                path="/user/package/history"
                element={<UserPackageHistory />}
              />
              {/* team routes */}
              <Route path="/user/team/tree" element={<Tree />} />
              <Route path="/user/team" element={<Team />} />
              <Route
                path="/user/team/new-register"
                element={<UserNewResgister />}
              />
              <Route path="/user/team/direct" element={<UserDirect />} />
              {/* earnings routes */}
              <Route
                path="/user/earnings/level-benefits"
                element={<UserLevelBenifits />}
              />
              <Route
                path="/user/earnings/daily-payout"
                element={<UserDailyPayout />}
              />
              <Route
                path="/user/earnings/roi-benefits"
                element={<UserROIBenefits />}
              />
              <Route path="/user/transactions" element={<UserTransaction />} />
              <Route path="/user/loantransactions" element={<UserLoanTransaction />} />
              <Route path="/user/mailbox" element={<UserMailBox />} />
               <Route path="/user/wallet" element={<UserWallet />} />
              <Route path="/user/support-chat" element={<UserSupportChat />} />
              <Route path="/user/chat" element={<UserChat />} />


            </Route>



            {/* not found route */}
            <Route
              element={<ProtectedRoute allowedRoles={["USER", "ADMIN"]} />}
            >
              <Route element={<ProtectedRoute allowedRoles={["USER", "ADMIN"]} />}>
                <Route path="*" element={<NotFound />} />
              </Route>
            </Route>
          </Routes>
          {shouldHide && shouldShowFooter && <Footer />}
        </div>
      </div>
      {!shouldHide && userRole === 'USER' && <MobileBottomNav />}
    </>
  );
};

export default App;
