import { ApolloProvider } from "@apollo/client";
import client from "graphql/apollo-client";
import dynamic from 'next/dynamic';
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import getViewer from "graphql/user/viewer";

const AnimeList = dynamic(() => import("container/anime-list"), {
  ssr: false,
});


export default function Home() {
  const router = useRouter();
  const [token, setToken] = useState<string | null | undefined>();
  const [clientId, setClientId] = useState<string | null | undefined>();

  useEffect(() => {
    const idClient  = process.env.ANILIST_CLIENT_ID;
    const token = localStorage.getItem('token');
    setToken(token);
    setClientId(idClient ?? "12244");
  }, [])

  useEffect(() => {
    if (window.location.href.includes("access_token")) {
      window.localStorage.setItem(
        "token",
        window.location.href.split("=")[1].split("&")[0] ?? "none",
      );
  
      router.push("/");
    }
  }, [router]);

  useEffect(() => {

    const authUser = localStorage.getItem("auth")

    if (token && !authUser) {
      
      const fetchData = async () => {
  
        try {
          const data : any = await getViewer({});
          const Viewer = data?.data?.Viewer;
          if (Viewer) {
            const auth = {
              id: Viewer?.id,
              name: Viewer?.name
            }

            localStorage.setItem("auth", JSON.stringify(auth))
          }
  
        } catch {
          console.log("error get viewer")
        } 
      }

      fetchData();
    }
  }, [token])

  const handleShowBookmark = () => {
    window.location.href = `/anime/bookmark`;
  }

  
  return (
    <>
      <div className="anime-page"> 
        <div className="anime-content">
          <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
            <h1 className="anime-title-page" style={{color: "#1b101f"}}>ANIME WORLD</h1>
            {
              !token && clientId && (<a href={`https://anilist.co/api/v2/oauth/authorize?client_id=${clientId}&response_type=token`}>Login with AniList</a>)
            }
            {
              token && (
                <div style={
                  {
                    display: "flex",
                    cursor: "pointer",
                    fontSize: 16,
                    alignItems: "center",
                    color: "#1b101f"
                  }}
                  onClick={handleShowBookmark}
                >
                  <p style={{fontWeight: 600, marginRight: 8}}>Bookmark</p>
                  <span className="material-symbols-rounded">bookmark</span>
                </div>)
            }
          </div>
          <ApolloProvider client={client}>
            <AnimeList />
          </ApolloProvider>
        </div>
      </div>
      <style jsx>
        {`
          .anime-page {
            min-width: 100vw;
            width: max-content;
            min-height: 100vh;
            height: max-content;
            display: flex;
            background-color: #faf9f2;
          }
          .anime-content {
            margin: 50px auto;
            max-width: 1200px;
            font-family: 'Nunito', sans-serif;
          }
          .anime-title-page {
            margin: 0 0 30px; 
            letter-spacing: 0.08rem;
          }
        `}
      </style>
    </>
  )
}


