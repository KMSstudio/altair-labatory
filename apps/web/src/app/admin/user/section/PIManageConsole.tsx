import { UserListByRole } from "./UserListByRole";
import { PromoteTo } from "./PromoteTo";
import { DemoteFrom } from "./DemoteFrom";

export function PIManageConsole (){
    return (
    <section>
      <h2>PI 관리</h2>
        <UserListByRole Role="PI"/>
        <PromoteTo promoteRole="PI"/>
        <DemoteFrom demoteRole="PI"/>
    </section>
  );
}

