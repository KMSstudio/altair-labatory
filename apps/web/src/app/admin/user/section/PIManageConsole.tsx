import { UserListByRole } from "./UserListByRole";
import { PromoteTo } from "./PromoteTo";
import { DemoteFrom } from "./DemoteFrom";
import { UserRole } from "@labatory/db";
import styles from "../../admin.module.css";

export function PIManageConsole() {
  return (
    <section className={styles.panel}>
      <header className={styles.panelHead}>
        <h2>PI 관리</h2>
      </header>
      <div className={styles.stack}>
        <UserListByRole userRole={UserRole.PI} />
        <PromoteTo promoteRole={UserRole.PI} />
        <DemoteFrom demoteRole={UserRole.PI} />
      </div>
    </section>
  );
}
