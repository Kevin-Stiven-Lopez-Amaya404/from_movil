# Inventario de colores escritos a mano

Baseline: commit `ed044c8` (rama `dev`, antes de esta migración). Búsqueda en `app/`, `components/` y `styles/` para archivos TS/TSX/JS/JSX/CSS/SCSS.

Se encontraron **129 archivos inspeccionados**, **170 usos** (**154 hex** y **16 rgba()**), y **69 valores únicos**. #FFFFFF aparece 48 veces y #fff una vez (49 blancos en total). El inventario conserva la ubicación original para hacer revisable la migración a tokens.

| Valor | Cantidad | Archivos | Token equivalente propuesto |
| --- | ---: | --- | --- |
| `#000` | 8 | components/dashboard/ActiveDevicesCard.styles.ts<br>components/dashboard/ConsumptionChartCard.tsx<br>components/dashboard/CurrentConsumptionCard.styles.ts<br>components/dashboard/EnergyAccumulatedCard.styles.ts<br>components/dashboard/HomeSummaryCard.styles.ts<br>components/homes/DeviceListItem.styles.ts<br>components/homes/EnergyRealtimeCard.styles.ts<br>components/homes/ShellyDeviceCard.styles.ts | `theme.shadowColor` |
| `#000000` | 5 | components/homes/HomeHeroCard.tsx<br>styles/(tabs)/change-password.styles.ts<br>styles/forgot-password.styles.ts<br>styles/new-password.styles.ts<br>styles/request-reactivation.styles.ts | `theme.shadowColor` |
| `#003380` | 1 | styles/welcome.styles.ts | `theme.primaryPressed / auth.welcomeButtonPressed` |
| `#0047AB` | 3 | styles/welcome.styles.ts | `theme.blue / theme.solidActionBackground` |
| `#004FA5` | 1 | components/auth/PrimaryButton.tsx | `theme.blue` |
| `#005CC1` | 2 | components/common/SplashAnimation.styles.ts<br>components/common/SplashAnimation.tsx | `excepción de SplashAnimation` |
| `#0864C8` | 2 | components/auth/AuthCheckboxRow.tsx<br>components/profile/profileTheme.ts | `theme.brandStrong / theme.blueForeground` |
| `#0A192F` | 3 | components/LiquidNavigation.tsx<br>styles/welcome.styles.ts | `theme.textPrimary / theme.shadowColor` |
| `#168044` | 1 | app/(tabs)/(main)/index.tsx | `theme.success` |
| `#16804A` | 2 | app/register.tsx | `theme.success` |
| `#1A332B` | 1 | app/(tabs)/(main)/index.tsx | `theme.decorativeAccent` |
| `#302640` | 1 | app/(tabs)/(main)/index.tsx | `theme.decorativeAccent` |
| `#34A853` | 1 | components/icons/GoogleIcon.tsx | `excepción de GoogleIcon` |
| `#39291E` | 1 | app/(tabs)/(main)/index.tsx | `theme.decorativeAccent` |
| `#3F3F3F` | 10 | components/auth/AuthCheckboxRow.tsx<br>components/auth/AuthTextField.styles.ts<br>components/profile/profileTheme.ts<br>styles/(tabs)/change-password.styles.ts<br>styles/forgot-password.styles.ts<br>styles/new-password.styles.ts<br>styles/request-reactivation.styles.ts | `theme.text` |
| `#4285F4` | 1 | components/icons/GoogleIcon.tsx | `excepción de GoogleIcon` |
| `#451A03` | 1 | styles/(tabs)/(main)/reports.styles.ts | `theme.onWarning (por revisar)` |
| `#5A3030` | 1 | components/homes/ShellyDeviceCard.tsx | `theme.danger` |
| `#666666` | 1 | styles/request-reactivation.styles.ts | `theme.muted` |
| `#6B7280` | 1 | components/profile/profileTheme.ts | `theme.<token semántico según uso>` |
| `#6D45BF` | 1 | app/(tabs)/(main)/index.tsx | `theme.decorativeAccent` |
| `#78909C` | 5 | components/homes/ShellyDeviceCard.tsx | `theme.muted` |
| `#86EFAC` | 2 | app/(tabs)/(main)/index.tsx<br>styles/(tabs)/(main)/homes.styles.ts | `theme.success` |
| `#8E99A8` | 1 | components/homes/ShellyDeviceCard.tsx | `theme.muted` |
| `#9AA8C2` | 1 | components/auth/PrimaryButton.tsx | `auth.disabledBackground` |
| `#B71C1C` | 1 | components/homes/ShellyDeviceCard.tsx | `theme.danger` |
| `#C15A10` | 1 | app/(tabs)/(main)/index.tsx | `theme.warning` |
| `#C4B5FD` | 1 | app/(tabs)/(main)/index.tsx | `theme.decorativeAccent` |
| `#C62828` | 1 | components/homes/ShellyDeviceCard.tsx | `theme.danger / auth.danger` |
| `#CBD5E1` | 3 | app/welcome.tsx<br>components/auth/AuthTextField.tsx | `theme.border / theme.textSecondary` |
| `#D32F2F` | 1 | components/auth/FormErrorText.tsx | `auth.formError` |
| `#D58A12` | 1 | app/register.tsx | `theme.warning` |
| `#D6EAE2` | 1 | styles/(tabs)/(main)/index.styles.ts | `theme.surfaceSecondary` |
| `#D8DADC` | 1 | components/auth/AuthCheckboxRow.tsx | `auth.checkboxIdle` |
| `#D99810` | 1 | app/(tabs)/(main)/homes.tsx | `theme.blue (estrella decorativa)` |
| `#DC4A4A` | 1 | app/register.tsx | `theme.<token semántico según uso>` |
| `#DDE2F5` | 1 | components/profile/profileTheme.ts | `auth.divider` |
| `#E0E0E0` | 1 | styles/new-password.styles.ts | `theme.divider` |
| `#E1E8F0` | 1 | app/register.tsx | `theme.border` |
| `#E1EAF5` | 1 | app/welcome.tsx | `theme.border` |
| `#E2E8F0` | 3 | styles/(tabs)/(main)/profile.styles.ts<br>styles/(tabs)/(main)/reports.styles.ts<br>styles/(tabs)/change-password.styles.ts | `theme.borderLight / theme.divider` |
| `#EA4335` | 1 | components/icons/GoogleIcon.tsx | `excepción de GoogleIcon` |
| `#EEF4FF` | 1 | components/profile/profileTheme.ts | `auth.primarySoft` |
| `#EFF9F1` | 1 | app/(tabs)/(main)/index.tsx | `theme.surfaceSecondary` |
| `#F1ECFF` | 1 | app/(tabs)/(main)/index.tsx | `theme.surfaceSecondary` |
| `#F4F6FF` | 1 | components/profile/profileTheme.ts | `theme.surfaceSecondary` |
| `#F5B400` | 2 | app/(tabs)/favorites.tsx<br>components/homes/HomeListItem.tsx | `theme.blue (estrella decorativa)` |
| `#F8FAFC` | 1 | components/homes/ShellyDeviceCard.tsx | `theme.textPrimary` |
| `#FBBC05` | 1 | components/icons/GoogleIcon.tsx | `excepción de GoogleIcon` |
| `#FBFBFD` | 5 | components/auth/AuthTextField.styles.ts<br>styles/(tabs)/change-password.styles.ts<br>styles/forgot-password.styles.ts<br>styles/new-password.styles.ts<br>styles/request-reactivation.styles.ts | `auth.card / auth.field` |
| `#FDBA74` | 1 | app/(tabs)/(main)/index.tsx | `theme.<token semántico según uso>` |
| `#FF3B20` | 2 | components/profile/profileTheme.ts<br>components/settings/SettingsSectionCard.tsx | `theme.danger / theme.warning` |
| `#FF4D4D` | 2 | app/(tabs)/change-password.tsx<br>app/new-password.tsx | `theme.danger` |
| `#FF4D4F` | 1 | components/LiquidNavigation.styles.ts | `theme.danger` |
| `#FFA500` | 2 | app/(tabs)/change-password.tsx<br>app/new-password.tsx | `theme.warning` |
| `#FFCDD2` | 1 | components/homes/ShellyDeviceCard.tsx | `theme.dangerSoft` |
| `#FFD1CB` | 2 | components/profile/profileTheme.ts<br>components/settings/SettingsSectionCard.tsx | `theme.<token semántico según uso>` |
| `#fff` | 1 | components/dashboard/EmptyDashboard.tsx | `theme.onPrimary / theme.onSolidAction` |
| `#FFF1EF` | 2 | components/profile/profileTheme.ts<br>components/settings/SettingsSectionCard.tsx | `theme.dangerSoft` |
| `#FFF2E7` | 1 | app/(tabs)/(main)/index.tsx | `theme.surfaceSecondary` |
| `#FFFFFF` | 48 | app/(tabs)/(main)/homes.tsx<br>app/(tabs)/(main)/notifications.tsx<br>app/(tabs)/(main)/reports.tsx<br>app/(tabs)/access.tsx<br>app/(tabs)/add-device.tsx<br>app/(tabs)/close-sessions.tsx<br>app/(tabs)/help.tsx<br>app/(tabs)/home-detail.tsx<br>app/(tabs)/invitations.tsx<br>app/(tabs)/language.tsx<br>app/(tabs)/prepare-shelly.tsx<br>app/(tabs)/shelly-setup.tsx<br>components/auth/PrimaryButton.tsx<br>components/dashboard/DashboardHeader.tsx<br>components/dashboard/EmptyDashboard.tsx<br>components/devices/ShellyBleScanner.styles.ts<br>components/devices/ShellyBleScanner.tsx<br>components/homes/DeviceListItem.tsx<br>components/homes/HomeHeroCard.tsx<br>components/homes/ShellyDeviceCard.tsx<br>components/icons/CheckIcon.tsx<br>components/LiquidNavigation.styles.ts<br>components/notifications/NotificationTabs.tsx<br>components/profile/profileTheme.ts<br>styles/(tabs)/(main)/homes.styles.ts<br>styles/(tabs)/(main)/notifications.styles.ts<br>styles/(tabs)/(main)/reports.styles.ts<br>styles/(tabs)/access.styles.ts<br>styles/(tabs)/add-device.styles.ts<br>styles/(tabs)/close-sessions.styles.ts<br>styles/(tabs)/home-detail.styles.ts<br>styles/(tabs)/prepare-shelly.styles.ts<br>styles/(tabs)/shelly-setup.styles.ts<br>styles/welcome.styles.ts | `theme.onPrimary / theme.onSolidAction / theme.surface` |
| `rgba(0, 71, 171, 0.08)` | 1 | styles/welcome.styles.ts | `theme.auth.welcomeSoftPressed` |
| `rgba(0,0,0,0.48)` | 1 | styles/(tabs)/(main)/homes.styles.ts | `theme.overlay` |
| `rgba(0,0,0,0.65)` | 1 | styles/(tabs)/(main)/reports.styles.ts | `theme.overlayStrong` |
| `rgba(116, 190, 255, 0.42)` | 1 | components/common/SplashAnimation.styles.ts | `excepción de SplashAnimation` |
| `rgba(148,163,184,0.25)` | 7 | styles/(tabs)/(main)/notifications.styles.ts<br>styles/(tabs)/(main)/profile.styles.ts<br>styles/(tabs)/about-smart-home.styles.ts<br>styles/(tabs)/account-security.styles.ts<br>styles/(tabs)/language.styles.ts<br>styles/(tabs)/personal-info.styles.ts | `theme.divider` |
| `rgba(15,23,42,0.48)` | 1 | styles/(tabs)/home-detail.styles.ts | `theme.overlay` |
| `rgba(16, 24, 39, 0.18)` | 2 | components/ui/HorizontalFilterTabs.tsx | `theme.overlaySubtle` |
| `rgba(255, 255, 255, 0.82)` | 2 | components/common/SplashAnimation.styles.ts | `excepción de SplashAnimation` |
