import { FuseNavigationItem } from "@fuse/components/navigation";

export interface User
{
    id: string;
    name: string;
    email: string;
    avatar?: string;
    status?: string;
    nombres?: string;
	apellidos?: string;
    navigationItems?: FuseNavigationItem[];
}
