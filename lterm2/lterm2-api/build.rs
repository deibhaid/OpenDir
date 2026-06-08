fn main() -> Result<(), Box<dyn std::error::Error>> {
    prost_build::Config::new()
        .out_dir(std::env::var("OUT_DIR")?)
        .compile_protos(&["proto/api.proto"], &["proto/"])?;
    Ok(())
}
