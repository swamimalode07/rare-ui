import { componentPageMetadata } from "@/lib/seo";
import Demo from "./demo";

export const metadata = componentPageMetadata("/components/gravityletters");

export default function Page() {
  return <Demo />;
}
