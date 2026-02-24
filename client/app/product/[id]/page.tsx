
import ProductDetails from '@/components/ProductDetails';

// Static params for export
export function generateStaticParams() {
    return [
        { id: 'hoodie' },
        { id: 'pants' },
        { id: 'tee' },
    ];
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <ProductDetails productId={id} />;
}
