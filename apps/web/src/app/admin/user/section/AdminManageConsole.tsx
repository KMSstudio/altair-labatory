import { UserListByRole } from "./UserListByRole";
import { PromoteTo } from "./PromoteTo";
import { DemoteFrom } from "./DemoteFrom";
import { UserRole } from "@labatory/db";
import styles from "../../admin.module.css";

export function AdminManageConsole() {
  return (
    <section className={styles.panel}>
      <header className={styles.panelHead}>
        <h2>ADMIN 관리</h2>
      </header>
      <div className={styles.stack}>
        <UserListByRole userRole={UserRole.ADMIN} />
        <PromoteTo promoteRole={UserRole.ADMIN} />
        <DemoteFrom demoteRole={UserRole.ADMIN} />
      </div>
    </section>
  );
}
