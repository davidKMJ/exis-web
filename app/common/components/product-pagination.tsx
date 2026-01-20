import { useSearchParams } from "react-router";
import {
    Pagination,
    PaginationItem,
    PaginationEllipsis,
    PaginationLink,
    PaginationPrevious,
    PaginationContent,
    PaginationNext,
} from "./ui/pagination";

type ProductPaginationProps = {
    totalPages: number;
};

export default function ProductPagination({
    totalPages,
}: ProductPaginationProps) {
    const [searchParams, setSearchParams] = useSearchParams();
    const page = Number(searchParams.get("page") ?? 1);
    // if (isNaN(page) || page < 1){
    //     return null;
    // }
    const onClick = (page: number) => {
        searchParams.set("page", page.toString());
        // setSearchParams(searchParams, {
        //     preventScrollReset: true,
        // });
        setSearchParams(searchParams, { preventScrollReset: true });
    };
    return (
        <Pagination>
            <PaginationContent>
                {page - 1 >= 1 && (
                    <>
                        <PaginationItem>
                            <PaginationPrevious
                                to={`?page=${page - 1}`}
                                onClick={(event) => {
                                    event.preventDefault();
                                    onClick(page - 1);
                                }}
                            />
                        </PaginationItem>
                        {page - 1 > 1 && (
                            <PaginationItem>
                                <PaginationEllipsis />
                            </PaginationItem>
                        )}
                        <PaginationItem>
                            <PaginationLink
                                to={`?page=${page - 1}`}
                                onClick={(event) => {
                                    event.preventDefault();
                                    onClick(page - 1);
                                }}
                            >
                                {page - 1}
                            </PaginationLink>
                        </PaginationItem>
                    </>
                )}
                <PaginationItem>
                    <PaginationLink
                        to={`?page=${page}`}
                        isActive
                        onClick={(event) => {
                            event.preventDefault();
                            onClick(page);
                        }}
                    >
                        {page}
                    </PaginationLink>
                </PaginationItem>
                {page + 1 <= totalPages && (
                    <>
                        <PaginationItem>
                            <PaginationLink
                                to={`?page=${page + 1}`}
                                onClick={(event) => {
                                    event.preventDefault();
                                    onClick(page + 1);
                                }}
                            >
                                {page + 1}
                            </PaginationLink>
                        </PaginationItem>
                        {page + 1 < totalPages && (
                            <PaginationItem>
                                <PaginationEllipsis />
                            </PaginationItem>
                        )}
                        <PaginationItem>
                            <PaginationNext
                                to={`?page=${page + 1}`}
                                onClick={(event) => {
                                    event.preventDefault();
                                    onClick(page + 1);
                                }}
                            />
                        </PaginationItem>
                    </>
                )}
            </PaginationContent>
        </Pagination>
    );
}
