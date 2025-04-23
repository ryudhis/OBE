"use client";

import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

function toTitleCase(str: string) {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}

export function CustomBreadCrumbs() {
  const pathname = usePathname();
  const pathParts = pathname.split("/").filter(Boolean);

  const disabledPaths = ["data", "input", "kelas"]; 

  const breadcrumbs = pathParts.map((part, index) => {
    const href = "/" + pathParts.slice(0, index + 1).join("/");
    const isLast = index === pathParts.length - 1;
    const isDisabled = disabledPaths.includes(part.toLowerCase());

    return (
      <div key={href} className="flex items-center font-medium text-lg">
        {index > 0 && (
          <BreadcrumbSeparator>
            <ChevronRight className="mr-4" />
          </BreadcrumbSeparator>
        )}
        <BreadcrumbItem>
          {isLast || isDisabled ? (
            <BreadcrumbPage>{toTitleCase(part)}</BreadcrumbPage>
          ) : (
            <BreadcrumbLink href={href}>{toTitleCase(part)}</BreadcrumbLink>
          )}
        </BreadcrumbItem>
      </div>
    );
  });

  return (
    <Breadcrumb className="m-6 uppercase">
      <BreadcrumbList>{breadcrumbs}</BreadcrumbList>
    </Breadcrumb>
  );
}
