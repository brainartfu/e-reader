import { useRouter } from 'next/router'
const MangaDetailHeader = ({ children, className }) => {
    const router = useRouter();
    return (
        <div className={"home_heading_design book_profile_header mb-20 " + className}>
            {children}
        </div>
    )
}

export default MangaDetailHeader;