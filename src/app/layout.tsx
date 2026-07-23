import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/frontend/components/AuthProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Anomalous Teacher Feedback System | MBMAN",
  description: "A secure, 100% anonymous feedback and review system for teachers at Madan Bhandari Memorial Academy Nepal.",
  verification: {
    google: "ro693PVgKzq1RCtDvyrw56_f6T0adACF8VI6kIjicBw",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Polyfill for Promise.withResolvers (Often breaks React 19 / Next 15+ on iOS < 17.4)
              if (typeof Promise.withResolvers === 'undefined') {
                Promise.withResolvers = function () {
                  var resolve, reject;
                  var promise = new Promise(function(res, rej) { resolve = res; reject = rej; });
                  return { promise: promise, resolve: resolve, reject: reject };
                };
              }
              // Polyfill for Array.prototype.at (iOS < 15.0)
              if (!Array.prototype.at) {
                Array.prototype.at = function(n) {
                  n = Math.trunc(n) || 0;
                  if (n < 0) n += this.length;
                  if (n < 0 || n >= this.length) return undefined;
                  return this[n];
                };
              }
              // Polyfill for String.prototype.replaceAll (iOS < 15.0)
              if (!String.prototype.replaceAll) {
                String.prototype.replaceAll = function(str, newStr) {
                  if (Object.prototype.toString.call(str).toLowerCase() === '[object regexp]') {
                    return this.replace(str, newStr);
                  }
                  return this.replace(new RegExp(str, 'g'), newStr);
                };
              }
              // Global Error Catcher for debugging blank screens
              window.onerror = function(msg, url, lineNo, columnNo, error) {
                if (!document.getElementById('ios-error-banner')) {
                  var div = document.createElement('div');
                  div.id = 'ios-error-banner';
                  div.style.cssText = 'position:fixed;top:0;left:0;right:0;background:red;color:white;z-index:9999;padding:20px;font-family:sans-serif;font-size:12px;overflow-wrap:break-word;';
                  div.innerHTML = '<b>App Error:</b> ' + msg + '<br>Line: ' + lineNo;
                  document.body.appendChild(div);
                }
                return false;
              };
            `
          }}
        />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
