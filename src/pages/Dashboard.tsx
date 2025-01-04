import { Categories } from "@/components/Categories";
import { Images } from "@/components/Images";
import { PageHeader, PageHeaderHeading } from "@/components/page-header";
import { Products } from "@/components/Products";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Variations } from "@/components/Variations";

export default function Dashboard() {
    return (
        <>
            <PageHeader>
                <PageHeaderHeading>Dashboard</PageHeaderHeading>
            </PageHeader>
            <Card>
                <h1 className="text-3xl font-bold">E-commerce Dashboard</h1>
                
            </Card>
        </>
    )
}
