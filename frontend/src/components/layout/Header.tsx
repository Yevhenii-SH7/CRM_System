import { useAuth } from "../../hooks/useAuth";
import { 
  AppBar,
  Toolbar,
  Title,
  AuthSection,
  UserInfoBox,
  UserName,
  UserRole,
  UserAvatar,
  AuthButtons,
  AuthButton
} from './styled/HeaderStyled';

interface HeaderProps {
  onAuthClick: (type: "login" | "register" | "forgot-password") => void;
}

function Header({ onAuthClick }: HeaderProps) {
  const { user, isAuthenticated, logout } = useAuth();
  console.log('Header component rendered:', { user, isAuthenticated }); // Debug log

  return (
    <AppBar position="fixed">
      <Toolbar variant="dense">
        <Title variant="h6">
          CRM Task Planner
        </Title>

        {/* Display different elements based on authentication status */}
        {isAuthenticated ? (
          <AuthSection>
            <UserInfoBox>
              <UserName variant="body2">
                Welcome, {user?.first_name} {user?.last_name}
              </UserName>
              <UserRole variant="body2">
                Role: {user?.role || "User"}
              </UserRole>
            </UserInfoBox>
            <UserAvatar>
              {user?.first_name?.[0]?.toUpperCase() || ""}
              {user?.last_name?.[0]?.toUpperCase() || ""}
            </UserAvatar>
            <AuthButton color="inherit" onClick={logout} size="small">
              Logout
            </AuthButton>
          </AuthSection>
        ) : (
          <AuthButtons>
            <AuthButton color="inherit" onClick={() => onAuthClick("login")}>
              Login
            </AuthButton>
            <AuthButton color="inherit" onClick={() => onAuthClick("register")}>
              Register
            </AuthButton>
          </AuthButtons>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Header;