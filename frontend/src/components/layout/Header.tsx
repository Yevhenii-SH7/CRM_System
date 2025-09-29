import { useAuth } from "../../hooks/useAuth";
import { useLocale } from "../../contexts/LocaleContext";
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
  const { t } = useLocale();
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
              {t('navigation.logout')}
            </AuthButton>
          </AuthSection>
        ) : (
          <AuthButtons>
            <AuthButton color="inherit" onClick={() => onAuthClick("login")}>
              {t('auth.login')}
            </AuthButton>
            <AuthButton color="inherit" onClick={() => onAuthClick("register")}>
              {t('auth.register')}
            </AuthButton>
          </AuthButtons>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Header;