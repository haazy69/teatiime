// Type declarations for CSS, SCSS, and other module imports
// This allows TypeScript to recognize CSS imports without errors
 
declare module "*.css";
declare module "*.scss";
declare module "*.sass";
declare module "*.less";
 
// For CSS modules
declare module "*.module.css" {
  const classes: { readonly [key: string]: string };
  export default classes;
}
 
declare module "*.module.scss" {
  const classes: { readonly [key: string]: string };
  export default classes;
}
 
