import { Auth_Card } from "@/components/card_components/auth_card";
import { DoubleText } from "@/components/ui_components/double_text";
import { Auth_Hero_Widget } from "@/components/widget_components/auth_hero_widget";
import { appName } from "@/data/constants/app_name";
import { AuthShellProps } from "../types";



export const Auth_Shell = ({ title, subtitle, children }: AuthShellProps) => {
  return (
    <main className="grid min-h-screen bg-background px-4 py-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-6 lg:p-6">
      <Auth_Hero_Widget />
      <section className="flex items-center justify-center">
        <div className="w-full max-w-xl">
          <Auth_Card>
            <div className="space-y-8">
              <div className="space-y-3">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  {appName}
                </span>
                <DoubleText subtitle={subtitle} title={title} />
              </div>
              {children}
            </div>
          </Auth_Card>
        </div>
      </section>
    </main>
  );
};
