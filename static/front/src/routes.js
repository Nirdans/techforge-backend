/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

/** 
  All of the routes for the Material Dashboard 2 React are added here,
  You can add a new route, customize the routes and delete the routes here.

  Once you add a new route on this file it will be visible automatically on
  the Sidenav.

  For adding a new route you can follow the existing routes in the routes array.
  1. The `type` key with the `collapse` value is used for a route.
  2. The `type` key with the `title` value is used for a title inside the Sidenav. 
  3. The `type` key with the `divider` value is used for a divider between Sidenav items.
  4. The `name` key is used for the name of the route on the Sidenav.
  5. The `key` key is used for the key of the route (It will help you with the key prop inside a loop).
  6. The `icon` key is used for the icon of the route on the Sidenav, you have to add a node.
  7. The `collapse` key is used for making a collapsible item on the Sidenav that has other routes
  inside (nested routes), you need to pass the nested routes inside an array as a value for the `collapse` key.
  8. The `route` key is used to store the route location which is used for the react router.
  9. The `href` key is used to store the external links location.
  10. The `title` key is only for the item with the type of `title` and its used for the title text on the Sidenav.
  10. The `component` key is used to store the component of its route.
*/

// Material Dashboard 2 React layouts
import Dashboard from "layouts/dashboard";
// import Tables from "layouts/tables"; // Supprimé du menu
// import Billing from "layouts/billing"; // Supprimé du menu
// import RTL from "layouts/rtl"; // Supprimé du menu
import ProfilePage from "layouts/profile/ProfilePage";
import Categories from "layouts/categories";
import CategoryDetails from "layouts/categories/details";
import Transactions from "layouts/transactions";
import TransactionDetails from "layouts/transactions/details";
import Groups from "layouts/groups";
import SignIn from "layouts/authentication/sign-in";
import SignUp from "layouts/authentication/sign-up";
import ResetPassword from "layouts/authentication/reset-password/cover";
import ValidateCodeCover from "layouts/authentication/reset-password/validate-code";
import ConfirmResetCover from "layouts/authentication/reset-password/confirm";

// @mui icons
import Icon from "@mui/material/Icon";

const routes = [
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    component: <Dashboard />,
  },
  {
    type: "collapse",
    name: "Catégories",
    key: "categories",
    icon: <Icon fontSize="small">category</Icon>,
    route: "/categories",
    component: <Categories />,
  },
  {
    type: "collapse",
    name: "Transactions",
    key: "transactions",
    icon: <Icon fontSize="small">receipt</Icon>,
    route: "/transactions",
    component: <Transactions />,
  },
  {
    type: "collapse",
    name: "Groups",
    key: "groups",
    icon: <Icon fontSize="small">groups</Icon>,
    route: "/groups",
    component: <Groups />,
  },
  // Routes cachées (non affichées dans le sidebar)
  {
    type: "route",
    name: "Profile",
    key: "profile",
    route: "/profile",
    component: <ProfilePage />,
  },
  {
    type: "route",
    name: "Sign In",
    key: "sign-in",
    route: "/authentication/sign-in",
    component: <SignIn />,
  },
  {
    type: "route",
    name: "Sign Up",
    key: "sign-up",
    route: "/authentication/sign-up",
    component: <SignUp />,
  },
  {
    type: "route",
    name: "Reset Password",
    key: "reset-password",
    route: "/authentication/reset-password/cover",
    component: <ResetPassword />,
  },
  {
    type: "route",
    name: "Validate Code",
    key: "validate-code",
    route: "/authentication/reset-password/validate-code",
    component: <ValidateCodeCover />,
  },
  {
    type: "route",
    name: "Confirm Reset",
    key: "confirm-reset",
    route: "/authentication/reset-password/confirm",
    component: <ConfirmResetCover />,
  },
  {
    type: "route",
    name: "Category Details",
    key: "category-details",
    route: "/categories/:id",
    component: <CategoryDetails />,
  },
  {
    type: "route",
    name: "Transaction Details",
    key: "transaction-details",
    route: "/transactions/:id",
    component: <TransactionDetails />,
  },
];

export default routes;
